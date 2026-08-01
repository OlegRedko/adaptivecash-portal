using Microsoft.EntityFrameworkCore;
using Portal.Api.Application.Signing;
using Portal.Api.Data;
using Portal.Api.Domain;

namespace Portal.Api.Infrastructure.Repositories;

public sealed class IdempotencyStore(PortalDbContext db) : IIdempotencyStore
{
    public Task<IdempotencyRecord?> FindAsync(
        string tenantId, string operation, string key, CancellationToken cancellationToken) =>
        db.IdempotencyRecords.SingleOrDefaultAsync(
            x => x.TenantId == tenantId && x.Operation == operation && x.Key == key,
            cancellationToken);

    public async Task<IdempotencyClaim> ClaimAsync(
        IdempotencyRecord candidate, CancellationToken cancellationToken)
    {
        db.IdempotencyRecords.Add(candidate);

        try
        {
            await db.SaveChangesAsync(cancellationToken);
            return new IdempotencyClaim(candidate, Claimed: true);
        }
        catch (DbUpdateException)
        {
            // The unique index on (TenantId, Operation, Key) rejected us: another request
            // claimed the key first, and its record is the authoritative one.
            db.ChangeTracker.Clear();

            var winner = await db.IdempotencyRecords.AsNoTracking().SingleAsync(
                x => x.TenantId == candidate.TenantId
                     && x.Operation == candidate.Operation
                     && x.Key == candidate.Key,
                cancellationToken);

            return new IdempotencyClaim(winner, Claimed: false);
        }
    }

    public void MarkCompleted(IdempotencyRecord record, string signingSessionId)
    {
        record.SigningSessionId = signingSessionId;
        record.Status = "Completed";
    }
}
