using Portal.Api.Domain;

namespace Portal.Api.Application.Signing;

public interface ISigningSessionRepository
{
    Task<SigningSessionRecord?> FindActiveAsync(
        string tenantId, string documentId, CancellationToken cancellationToken);

    Task<SigningSessionRecord?> FindByIdAsync(
        string tenantId, string sessionId, CancellationToken cancellationToken);

    /// <summary>Loads a tracked session so its status can be changed within the current unit of work.</summary>
    Task<SigningSessionRecord?> FindForUpdateAsync(
        string tenantId, string sessionId, CancellationToken cancellationToken);

    void Add(SigningSessionRecord session);
}
