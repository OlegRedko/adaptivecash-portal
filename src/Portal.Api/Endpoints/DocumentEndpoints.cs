using Microsoft.EntityFrameworkCore;
using Portal.Api.Contracts;
using Portal.Api.Data;
using Portal.Api.Infrastructure;

namespace Portal.Api.Endpoints;

public static class DocumentEndpoints
{
    public static IEndpointRouteBuilder MapDocumentEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/documents",
            async (string? search, string? status, PortalDbContext db, TenantContext tenant, CancellationToken ct) =>
            {
                var t = tenant.RequireTenant();
                var q = db.Documents.AsNoTracking().Where(x => x.TenantId == t);
                if (!string.IsNullOrWhiteSpace(search)) q = q.Where(x => x.Title.Contains(search));
                if (!string.IsNullOrWhiteSpace(status)) q = q.Where(x => x.Status == status);
                var items = await q.Select(x =>
                        new DocumentSummaryDto(x.Id, x.Title, x.Status, x.Signer, x.CreatedAt, x.UpdatedAt))
                    .ToListAsync(ct);
                return items.OrderByDescending(x => x.UpdatedAt).ToList();
            });
        app.MapGet("/api/documents/{id}",
            async (string id, PortalDbContext db, TenantContext tenant, CancellationToken ct) =>
            {
                var t = tenant.RequireTenant();
                var d = await db.Documents.AsNoTracking().SingleOrDefaultAsync(x => x.TenantId == t && x.Id == id, ct);
                if (d is null) return Results.NotFound();
                var sessions = await db.SigningSessions.AsNoTracking()
                    .Where(x => x.TenantId == t && x.DocumentId == id).Select(x =>
                        new SigningSessionDto(x.Id, x.DocumentId, x.Status, x.Provider, x.CreatedAt, x.ExpiresAt))
                    .ToListAsync(ct);
                var s = sessions.OrderByDescending(x => x.CreatedAt).FirstOrDefault();
                return Results.Ok(new DocumentDetailDto(d.Id, d.Title, d.Status, d.Signer, d.ContentType, d.CreatedAt,
                    d.UpdatedAt, s));
            });
        app.MapGet("/api/documents/{id}/active-signing-session",
            async (string id, PortalDbContext db, TenantContext tenant, CancellationToken ct) =>
            {
                var t = tenant.RequireTenant();
                var terminal = new[] { "Verified", "Failed", "Expired" };
                var active = await db.SigningSessions.AsNoTracking()
                    .Where(x => x.TenantId == t && x.DocumentId == id && !terminal.Contains(x.Status)).Select(x =>
                        new SigningSessionDto(x.Id, x.DocumentId, x.Status, x.Provider, x.CreatedAt, x.ExpiresAt))
                    .ToListAsync(ct);
                var s = active.OrderByDescending(x => x.CreatedAt).FirstOrDefault();
                return s is null ? Results.NoContent() : Results.Ok(s);
            });
        return app;
    }
}