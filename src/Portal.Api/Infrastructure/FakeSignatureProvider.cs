using System.Collections.Concurrent;

namespace Portal.Api.Infrastructure;

public enum FakeProviderScenario
{
    Success,
    UnavailableBeforeAcceptance,
    TimeoutAfterAcceptance
}

public sealed record ProviderSession(
    string ProviderReference,
    DateTimeOffset CreatedAt,
    DateTimeOffset ExpiresAt);

public interface IFakeSignatureProvider
{
    Task<ProviderSession> CreateAsync(
        string tenantId,
        string documentId,
        string idempotencyKey,
        FakeProviderScenario scenario,
        CancellationToken cancellationToken);

    Task<ProviderSession?> FindAsync(
        string tenantId,
        string documentId,
        string idempotencyKey,
        CancellationToken cancellationToken);
}

public sealed class FakeSignatureProvider : IFakeSignatureProvider
{
    private readonly ConcurrentDictionary<string, ProviderSession> accepted = new();

    public Task<ProviderSession> CreateAsync(
        string tenantId,
        string documentId,
        string idempotencyKey,
        FakeProviderScenario scenario,
        CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();

        if (scenario == FakeProviderScenario.UnavailableBeforeAcceptance)
            throw new FakeProviderUnavailableException();

        var value = accepted.GetOrAdd(
            Key(tenantId, documentId, idempotencyKey),
            _ => new ProviderSession(
                $"provider-{Guid.NewGuid():N}",
                DateTimeOffset.UtcNow,
                DateTimeOffset.UtcNow.AddMinutes(5)));

        if (scenario == FakeProviderScenario.TimeoutAfterAcceptance)
            throw new FakeProviderTimeoutAfterAcceptanceException();

        return Task.FromResult(value);
    }

    public Task<ProviderSession?> FindAsync(
        string tenantId,
        string documentId,
        string idempotencyKey,
        CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        accepted.TryGetValue(Key(tenantId, documentId, idempotencyKey), out var value);
        return Task.FromResult(value);
    }

    private static string Key(string tenantId, string documentId, string idempotencyKey) =>
        $"{tenantId}|{documentId}|{idempotencyKey}";
}

public sealed class FakeProviderUnavailableException : Exception
{
}

public sealed class FakeProviderTimeoutAfterAcceptanceException : Exception
{
}
