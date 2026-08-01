using Portal.Api.Domain;

namespace Portal.Api.Application.Signing;

/// <summary>Outcome of trying to claim an idempotency key.</summary>
/// <param name="Record">The record that now owns the key, whoever claimed it.</param>
/// <param name="Claimed">False when another request won the race.</param>
public sealed record IdempotencyClaim(IdempotencyRecord Record, bool Claimed);

public interface IIdempotencyStore
{
    Task<IdempotencyRecord?> FindAsync(
        string tenantId, string operation, string key, CancellationToken cancellationToken);

    Task<IdempotencyClaim> ClaimAsync(
        IdempotencyRecord candidate, CancellationToken cancellationToken);

    void MarkCompleted(IdempotencyRecord record, string signingSessionId);
}
