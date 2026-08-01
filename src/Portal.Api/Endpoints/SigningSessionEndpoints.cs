using Portal.Api.Application.Signing;
using Portal.Api.Infrastructure;

namespace Portal.Api.Endpoints;

public static class SigningSessionEndpoints
{
    public static IEndpointRouteBuilder MapSigningSessionEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/signing-sessions/{id}",
            async (string id,
                TenantContext tenant,
                ISigningSessionStatusService signingSessions,
                CancellationToken ct) =>
            {
                var session = await signingSessions.GetAsync(tenant.RequireTenant(), id, ct);
                return session is null ? Results.NotFound() : Results.Ok(session);
            });

        return app;
    }
}
