using Portal.Api.Contracts;

namespace Portal.Api.Endpoints;

public static class CreateSigningSessionEndpoint
{
    public static IEndpointRouteBuilder MapCreateSigningSessionEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/documents/{documentId}/signing-sessions",
            (string documentId, CreateSigningSessionBody body, HttpRequest request) => Results.Problem(statusCode: 501,
                title: "Candidate TODO",
                detail:
                "Implement durable idempotency, concurrency handling, 409/503/504 semantics and fake-provider integration. The Idempotency-Key header is available in the request."));
        return app;
    }
}