using Portal.Api.Contracts;
using Portal.Api.Infrastructure;
using Portal.Api.Application.Signing;

namespace Portal.Api.Endpoints;

public static class CreateSigningSessionEndpoint
{
    public static IEndpointRouteBuilder MapCreateSigningSessionEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/documents/{documentId}/signing-sessions", CreateAsync);
        return app;
    }

    private static async Task<IResult> CreateAsync(
        string documentId,
        CreateSigningSessionBody body,
        HttpRequest request,
        TenantContext tenant,
        ISigningSessionService signingSessions,
        CancellationToken ct)
    {
        var tenantId = tenant.RequireTenant();

        var idempotencyKey = request.Headers["Idempotency-Key"].ToString();
        if (string.IsNullOrWhiteSpace(idempotencyKey))
            return Results.Problem(statusCode: 400, title: "Idempotency-Key is required.");

        var result = await signingSessions.CreateAsync(
            new CreateSigningSessionCommand(
                tenantId, documentId, body.DocumentId, idempotencyKey, ReadScenario(request)),
            ct);

        return result.Outcome switch
        {
            CreateSigningSessionOutcome.Created =>
                Results.Created($"/api/signing-sessions/{result.Session!.Id}", result.Session),

            CreateSigningSessionOutcome.AlreadyCreated =>
                Results.Ok(result.Session),

            CreateSigningSessionOutcome.DocumentNotFound =>
                Results.NotFound(),

            CreateSigningSessionOutcome.ActiveSessionExists =>
                Conflict("ACTIVE_SESSION",
                    "This document already has an active signing session.",
                    result.ExistingSessionId),

            CreateSigningSessionOutcome.KeyReusedForDifferentRequest =>
                Conflict("IDEMPOTENCY_KEY_REUSED",
                    "This Idempotency-Key was used for a different request."),

            CreateSigningSessionOutcome.ConcurrentAttemptInProgress =>
                Conflict("ATTEMPT_IN_PROGRESS", "The same operation is already in progress."),

            CreateSigningSessionOutcome.ProviderUnavailable =>
                Results.Problem(
                    statusCode: 503,
                    title: "The signature provider did not accept the request.",
                    detail: "Retry with the same Idempotency-Key."),

            CreateSigningSessionOutcome.ProviderTimeout =>
                Results.Problem(
                    statusCode: 504,
                    title: "The signature provider did not answer in time.",
                    detail: "The request may have been accepted. Retry with the same Idempotency-Key to reconcile."),

            _ => Results.Problem(statusCode: 500, title: "Unexpected signing outcome."),
        };
    }

    private static IResult Conflict(string code, string title, string? existingSessionId = null)
    {
        var extensions = new Dictionary<string, object?> { ["code"] = code };
        if (existingSessionId is not null) extensions["existingSessionId"] = existingSessionId;

        return Results.Problem(statusCode: 409, title: title, extensions: extensions);
    }

    private static FakeProviderScenario ReadScenario(HttpRequest request) =>
        Enum.TryParse<FakeProviderScenario>(request.Headers["X-Fake-Provider-Scenario"], true, out var scenario)
            ? scenario
            : FakeProviderScenario.Success;
}
