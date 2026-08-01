using System.Net;
using System.Net.Http.Json;

namespace Portal.Api.Tests;

public sealed class DocumentApiTests(PortalApiFactory app) : IClassFixture<PortalApiFactory>
{
    private sealed record DocumentDto(string Id, string Title, string Status);

    [Fact]
    public async Task List_is_tenant_scoped()
    {
        var documents = await app.CreateClientFor("branch-demo")
            .GetFromJsonAsync<List<DocumentDto>>("/api/documents");

        Assert.NotNull(documents);
        Assert.NotEmpty(documents!);
        Assert.All(documents!, document => Assert.StartsWith("BR-", document.Id));
    }

    [Fact]
    public async Task Missing_document_returns_404()
    {
        var response = await app.CreateClientFor("branch-demo").GetAsync("/api/documents/missing");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task A_document_of_another_tenant_is_not_reachable()
    {
        var response = await app.CreateClientFor("customer-demo").GetAsync("/api/documents/BR-DOC-001");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
