using Portal.Api.Domain;

namespace Portal.Api.Application.Signing;

public interface ISigningSessionRepository
{
    Task<bool> DocumentExistsAsync(
        string tenantId, string documentId, CancellationToken cancellationToken);

    Task<SigningSessionRecord?> FindActiveAsync(
        string tenantId, string documentId, CancellationToken cancellationToken);

    Task<SigningSessionRecord?> FindByIdAsync(
        string tenantId, string sessionId, CancellationToken cancellationToken);

    void Add(SigningSessionRecord session);
}
