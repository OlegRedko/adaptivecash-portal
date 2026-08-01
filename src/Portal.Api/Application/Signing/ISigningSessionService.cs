namespace Portal.Api.Application.Signing;

public interface ISigningSessionService
{
    Task<CreateSigningSessionResult> CreateAsync(
        CreateSigningSessionCommand command,
        CancellationToken cancellationToken);
}
