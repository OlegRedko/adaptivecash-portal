using Portal.Api.Contracts;

namespace Portal.Api.Application.Signing;

public interface ISigningSessionStatusService
{
    /// <summary>
    /// Returns the current state of a signing session, advancing the simulated provider
    /// progression and mirroring any terminal outcome onto the document.
    /// </summary>
    Task<SigningSessionDto?> GetAsync(
        string tenantId, string sessionId, CancellationToken cancellationToken);
}
