namespace Portal.Api.Application.Signing;

public enum CreateSigningSessionOutcome
{
    Created,
    AlreadyCreated,
    DocumentNotFound,
    ActiveSessionExists,
    KeyReusedForDifferentRequest,
    ConcurrentAttemptInProgress,
    ProviderUnavailable,
    ProviderTimeout,
}
