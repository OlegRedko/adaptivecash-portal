using Portal.Api.Application.Documents;
using Portal.Api.Contracts;
using Portal.Api.Domain;
using Portal.Api.Infrastructure;

namespace Portal.Api.Application.Signing;

/// <summary>
/// Orchestrates one signing attempt: claim the idempotency key, ask the provider,
/// persist the session. Persistence and provider details live behind their own abstractions.
/// </summary>
public sealed class SigningSessionService(
    ISigningSessionRepository sessions,
    IDocumentRepository documents,
    IIdempotencyStore idempotency,
    IFakeSignatureProvider provider,
    IUnitOfWork unitOfWork) : ISigningSessionService
{
    public async Task<CreateSigningSessionResult> CreateAsync(
        CreateSigningSessionCommand command, CancellationToken cancellationToken)
    {
        if (!await documents.ExistsAsync(command.TenantId, command.DocumentId, cancellationToken))
            return CreateSigningSessionResult.Failed(CreateSigningSessionOutcome.DocumentNotFound);

        var attempt = await ResolveAttemptAsync(command, cancellationToken);
        if (attempt.Result is not null) return attempt.Result;

        var accepted = await AcceptWithProviderAsync(command, cancellationToken);
        if (accepted.Result is not null) return accepted.Result;

        return await PersistAsync(command, attempt.Record!, accepted.Session!, cancellationToken);
    }

    /// <summary>Finds or claims the idempotency record, short-circuiting on replay and conflict.</summary>
    private async Task<(IdempotencyRecord? Record, CreateSigningSessionResult? Result)> ResolveAttemptAsync(
        CreateSigningSessionCommand command, CancellationToken cancellationToken)
    {
        var fingerprint = SigningSessionIdentity.Fingerprint(command);

        var existing = await idempotency.FindAsync(
            command.TenantId, SigningSessionIdentity.Operation, command.IdempotencyKey, cancellationToken);

        if (existing is not null)
        {
            if (existing.RequestHash != fingerprint)
                return (null, CreateSigningSessionResult.Failed(
                    CreateSigningSessionOutcome.KeyReusedForDifferentRequest));

            if (existing.SigningSessionId is not null)
                return (null, await ReplayAsync(command.TenantId, existing.SigningSessionId, cancellationToken));

            return (existing, null);
        }

        var active = await sessions.FindActiveAsync(command.TenantId, command.DocumentId, cancellationToken);
        if (active is not null)
            return (null, CreateSigningSessionResult.ActiveSessionExists(active.Id));

        var claim = await idempotency.ClaimAsync(
            new IdempotencyRecord
            {
                TenantId = command.TenantId,
                DocumentId = command.DocumentId,
                Operation = SigningSessionIdentity.Operation,
                Key = command.IdempotencyKey,
                RequestHash = fingerprint,
                Status = "Pending",
                CreatedAt = DateTimeOffset.UtcNow,
            },
            cancellationToken);

        if (claim.Claimed) return (claim.Record, null);

        return (null, claim.Record.SigningSessionId is not null
            ? await ReplayAsync(command.TenantId, claim.Record.SigningSessionId, cancellationToken)
            : CreateSigningSessionResult.Failed(CreateSigningSessionOutcome.ConcurrentAttemptInProgress));
    }

    /// <summary>
    /// Asks the provider, preferring anything it already accepted under this key. That lookup is
    /// what turns a lost response into reconciliation rather than a second command.
    /// </summary>
    private async Task<(ProviderSession? Session, CreateSigningSessionResult? Result)> AcceptWithProviderAsync(
        CreateSigningSessionCommand command, CancellationToken cancellationToken)
    {
        try
        {
            var session =
                await provider.FindAsync(
                    command.TenantId, command.DocumentId, command.IdempotencyKey, cancellationToken)
                ?? await provider.CreateAsync(
                    command.TenantId, command.DocumentId, command.IdempotencyKey, command.Scenario,
                    cancellationToken);

            return (session, null);
        }
        catch (FakeProviderUnavailableException)
        {
            return (null, CreateSigningSessionResult.Failed(CreateSigningSessionOutcome.ProviderUnavailable));
        }
        catch (FakeProviderTimeoutAfterAcceptanceException)
        {
            return (null, CreateSigningSessionResult.Failed(CreateSigningSessionOutcome.ProviderTimeout));
        }
    }

    private async Task<CreateSigningSessionResult> PersistAsync(
        CreateSigningSessionCommand command,
        IdempotencyRecord record,
        ProviderSession accepted,
        CancellationToken cancellationToken)
    {
        var session = new SigningSessionRecord
        {
            Id = SigningSessionIdentity.SessionId(command),
            TenantId = command.TenantId,
            DocumentId = command.DocumentId,
            Status = "Pending",
            ProviderReference = accepted.ProviderReference,
            CreatedAt = accepted.CreatedAt,
            ExpiresAt = accepted.ExpiresAt,
        };

        sessions.Add(session);
        idempotency.MarkCompleted(record, session.Id);
        await MarkDocumentSigningAsync(command, cancellationToken);

        // A rejected commit means a concurrent request already stored the same session.
        return await unitOfWork.TryCommitAsync(cancellationToken)
            ? CreateSigningSessionResult.Created(ToDto(session))
            : await ReplayAsync(command.TenantId, session.Id, cancellationToken);
    }

    /// <summary>Moves the document to Signing in the same unit of work that stores the session.</summary>
    private async Task MarkDocumentSigningAsync(
        CreateSigningSessionCommand command, CancellationToken cancellationToken)
    {
        var document = await documents.FindForUpdateAsync(
            command.TenantId, command.DocumentId, cancellationToken);

        if (document is null || document.Status == DocumentStatuses.Signing) return;

        document.Status = DocumentStatuses.Signing;
        document.UpdatedAt = DateTimeOffset.UtcNow;
    }

    private async Task<CreateSigningSessionResult> ReplayAsync(
        string tenantId, string sessionId, CancellationToken cancellationToken)
    {
        var session = await sessions.FindByIdAsync(tenantId, sessionId, cancellationToken);

        return session is null
            ? CreateSigningSessionResult.Failed(CreateSigningSessionOutcome.DocumentNotFound)
            : CreateSigningSessionResult.AlreadyCreated(ToDto(session));
    }

    private static SigningSessionDto ToDto(SigningSessionRecord session) => new(
        session.Id, session.DocumentId, session.Status, session.Provider,
        session.CreatedAt, session.ExpiresAt);
}
