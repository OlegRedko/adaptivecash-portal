using System.Net;
using System.Net.Http.Json;

namespace Portal.Api.Tests;

/// <summary>
/// Each test owns a factory, and therefore a database. Signing is stateful — one document
/// may hold only one active session — so sharing a database between tests would make the
/// outcome depend on execution order.
/// </summary>
public sealed class CreateSigningSessionCandidateTests
{
    private const string Tenant = "branch-demo";
    private const string DocumentId = "BR-DOC-001";

    private static HttpRequestMessage Request(string documentId, string key, string? scenario = null)
    {
        var request = new HttpRequestMessage(
            HttpMethod.Post, $"/api/documents/{documentId}/signing-sessions")
        {
            Content = JsonContent.Create(new { documentId }),
        };

        request.Headers.Add("Idempotency-Key", key);
        if (scenario is not null) request.Headers.Add("X-Fake-Provider-Scenario", scenario);

        return request;
    }

    private sealed record SessionDto(string Id, string DocumentId, string Status);

    [Fact]
    public async Task Concurrent_same_key_creates_one_session()
    {
        using var app = new PortalApiFactory();
        var client = app.CreateClientFor(Tenant);
        const string key = "concurrent-key";

        var responses = await Task.WhenAll(
            Enumerable.Range(0, 6).Select(_ => client.SendAsync(Request(DocumentId, key))));

        var sessionIds = new List<string>();
        foreach (var response in responses)
        {
            Assert.True(
                response.StatusCode is HttpStatusCode.Created or HttpStatusCode.OK
                    or HttpStatusCode.Conflict,
                $"Unexpected status {(int)response.StatusCode}");

            if (response.StatusCode is HttpStatusCode.Created or HttpStatusCode.OK)
                sessionIds.Add((await response.Content.ReadFromJsonAsync<SessionDto>())!.Id);
        }

        Assert.NotEmpty(sessionIds);
        Assert.Single(sessionIds.Distinct());
        Assert.Single(responses, r => r.StatusCode == HttpStatusCode.Created);
    }

    [Fact]
    public async Task Same_key_different_payload_returns_409()
    {
        using var app = new PortalApiFactory();
        var client = app.CreateClientFor(Tenant);
        const string key = "reused-key";

        var first = await client.SendAsync(Request(DocumentId, key));
        Assert.Equal(HttpStatusCode.Created, first.StatusCode);

        // Same key, a different document: the request no longer matches the stored fingerprint.
        var second = await client.SendAsync(Request("BR-DOC-003", key));

        Assert.Equal(HttpStatusCode.Conflict, second.StatusCode);
        var problem = await second.Content.ReadFromJsonAsync<Dictionary<string, object>>();
        Assert.Equal("IDEMPOTENCY_KEY_REUSED", problem!["code"].ToString());
    }

    [Fact]
    public async Task Durable_record_survives_new_service_scope()
    {
        using var app = new PortalApiFactory();
        const string key = "durable-key";

        var first = await app.CreateClientFor(Tenant).SendAsync(Request(DocumentId, key));
        Assert.Equal(HttpStatusCode.Created, first.StatusCode);
        var created = await first.Content.ReadFromJsonAsync<SessionDto>();

        // A second request resolves a fresh scope and a fresh DbContext, so returning the
        // same session can only come from the persisted idempotency record.
        var replay = await app.CreateClientFor(Tenant).SendAsync(Request(DocumentId, key));

        Assert.Equal(HttpStatusCode.OK, replay.StatusCode);
        Assert.Equal(created!.Id, (await replay.Content.ReadFromJsonAsync<SessionDto>())!.Id);
    }

    [Fact]
    public async Task Retry_after_503_reuses_the_key_and_creates_one_session()
    {
        using var app = new PortalApiFactory();
        var client = app.CreateClientFor(Tenant);
        const string key = "unavailable-key";

        var unavailable = await client.SendAsync(
            Request(DocumentId, key, "UnavailableBeforeAcceptance"));
        Assert.Equal(HttpStatusCode.ServiceUnavailable, unavailable.StatusCode);

        var retry = await client.SendAsync(Request(DocumentId, key));
        Assert.Equal(HttpStatusCode.Created, retry.StatusCode);
    }

    [Fact]
    public async Task Retry_after_504_adopts_the_session_the_provider_accepted()
    {
        using var app = new PortalApiFactory();
        var client = app.CreateClientFor(Tenant);
        const string key = "timeout-key";

        var timeout = await client.SendAsync(Request(DocumentId, key, "TimeoutAfterAcceptance"));
        Assert.Equal(HttpStatusCode.GatewayTimeout, timeout.StatusCode);

        // The provider accepted before the response was lost, so the retry must reconcile
        // onto that acceptance rather than start a second command.
        var reconciled = await client.SendAsync(Request(DocumentId, key));
        Assert.Equal(HttpStatusCode.Created, reconciled.StatusCode);

        var newKey = await client.SendAsync(Request(DocumentId, "different-key"));
        Assert.Equal(HttpStatusCode.Conflict, newKey.StatusCode);
    }

    [Fact]
    public async Task Tenant_cannot_create_a_session_for_another_tenants_document()
    {
        using var app = new PortalApiFactory();

        var response = await app.CreateClientFor("customer-demo")
            .SendAsync(Request(DocumentId, "cross-tenant-key"));

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
