using Portal.Api.Application.Documents;
using Portal.Api.Contracts;
using Portal.Api.Domain;

namespace Portal.Api.Application.Signing;

/// <summary>
/// Reads a signing session and keeps the document in step with it.
///
/// The provider is simulated, so progression is driven by elapsed time on read. A real
/// provider would push a callback, or a background job would reconcile; either way the
/// server stays the only thing that decides a terminal status.
/// </summary>
public sealed class SigningSessionStatusService(
    ISigningSessionRepository sessions,
    IDocumentRepository documents,
    IUnitOfWork unitOfWork) : ISigningSessionStatusService
{
    private static readonly TimeSpan AcceptedAfter = TimeSpan.FromSeconds(2);
    private static readonly TimeSpan CompletedAfter = TimeSpan.FromSeconds(7);

    public async Task<SigningSessionDto?> GetAsync(
        string tenantId, string sessionId, CancellationToken cancellationToken)
    {
        var session = await sessions.FindForUpdateAsync(tenantId, sessionId, cancellationToken);
        if (session is null) return null;

        var advanced = Advance(session);
        if (advanced) await SyncDocumentAsync(tenantId, session, cancellationToken);

        return ToDto(session);
    }

    /// <summary>Applies the simulated provider progression. Returns true when the status changed.</summary>
    private static bool Advance(SigningSessionRecord session)
    {
        var before = session.Status;
        var elapsed = DateTimeOffset.UtcNow - session.CreatedAt;

        if (session.Status == "Pending" && elapsed > AcceptedAfter)
            session.Status = "AwaitingProvider";

        if (session.Status == "AwaitingProvider" && elapsed > CompletedAfter)
            session.Status = session.DocumentId.EndsWith("FAIL", StringComparison.OrdinalIgnoreCase)
                ? "Failed"
                : "Verified";

        if (session.ExpiresAt <= DateTimeOffset.UtcNow && session.Status is not ("Verified" or "Failed"))
            session.Status = "Expired";

        return session.Status != before;
    }

    private async Task SyncDocumentAsync(
        string tenantId, SigningSessionRecord session, CancellationToken cancellationToken)
    {
        var documentStatus = DocumentStatuses.ForSessionStatus(session.Status);

        if (documentStatus is not null)
        {
            var document = await documents.FindForUpdateAsync(
                tenantId, session.DocumentId, cancellationToken);

            if (document is not null && document.Status != documentStatus)
            {
                document.Status = documentStatus;
                document.UpdatedAt = DateTimeOffset.UtcNow;
            }
        }

        await unitOfWork.TryCommitAsync(cancellationToken);
    }

    private static SigningSessionDto ToDto(SigningSessionRecord session) => new(
        session.Id, session.DocumentId, session.Status, session.Provider,
        session.CreatedAt, session.ExpiresAt);
}
