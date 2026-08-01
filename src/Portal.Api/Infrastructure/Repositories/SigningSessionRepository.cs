using Microsoft.EntityFrameworkCore;
using Portal.Api.Application.Signing;
using Portal.Api.Data;
using Portal.Api.Domain;

namespace Portal.Api.Infrastructure.Repositories;

public sealed class SigningSessionRepository(PortalDbContext db) : ISigningSessionRepository
{
    private static readonly string[] TerminalStatuses = ["Verified", "Failed", "Expired"];

    public Task<bool> DocumentExistsAsync(
        string tenantId, string documentId, CancellationToken cancellationToken) =>
        db.Documents.AsNoTracking()
            .AnyAsync(x => x.TenantId == tenantId && x.Id == documentId, cancellationToken);

    public async Task<SigningSessionRecord?> FindActiveAsync(
        string tenantId, string documentId, CancellationToken cancellationToken)
    {
        // Ordering happens in memory: SQLite cannot ORDER BY a DateTimeOffset.
        var open = await db.SigningSessions.AsNoTracking()
            .Where(x => x.TenantId == tenantId && x.DocumentId == documentId)
            .Where(x => !TerminalStatuses.Contains(x.Status))
            .ToListAsync(cancellationToken);

        return open.OrderByDescending(x => x.CreatedAt).FirstOrDefault();
    }

    public Task<SigningSessionRecord?> FindByIdAsync(
        string tenantId, string sessionId, CancellationToken cancellationToken) =>
        db.SigningSessions.AsNoTracking().SingleOrDefaultAsync(
            x => x.TenantId == tenantId && x.Id == sessionId, cancellationToken);

    public void Add(SigningSessionRecord session) => db.SigningSessions.Add(session);
}
