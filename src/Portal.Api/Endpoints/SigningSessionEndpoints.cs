using Microsoft.EntityFrameworkCore;
using Portal.Api.Contracts;
using Portal.Api.Data;
using Portal.Api.Infrastructure;

namespace Portal.Api.Endpoints;

public static class SigningSessionEndpoints
{
    public static IEndpointRouteBuilder MapSigningSessionEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/signing-sessions/{id}",
            async (string id, PortalDbContext db, TenantContext tenant, CancellationToken ct) =>
            {
                var t = tenant.RequireTenant();
                var s = await db.SigningSessions.SingleOrDefaultAsync(x => x.TenantId == t && x.Id == id, ct);
                if (s is null) return Results.NotFound();
                var elapsed = DateTimeOffset.UtcNow - s.CreatedAt;
                if (s.Status == "Pending" && elapsed > TimeSpan.FromSeconds(2)) s.Status = "AwaitingProvider";
                if (s.Status == "AwaitingProvider" && elapsed > TimeSpan.FromSeconds(7))
                    s.Status = s.DocumentId.EndsWith("FAIL", StringComparison.OrdinalIgnoreCase)
                        ? "Failed"
                        : "Verified";
                if (s.ExpiresAt <= DateTimeOffset.UtcNow && !new[] { "Verified", "Failed" }.Contains(s.Status))
                    s.Status = "Expired";
                await db.SaveChangesAsync(ct);
                return Results.Ok(new SigningSessionDto(s.Id, s.DocumentId, s.Status, s.Provider, s.CreatedAt,
                    s.ExpiresAt));
            });
        return app;
    }
}