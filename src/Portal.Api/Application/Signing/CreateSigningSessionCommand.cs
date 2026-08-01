using Portal.Api.Infrastructure;

namespace Portal.Api.Application.Signing;

public sealed record CreateSigningSessionCommand(
    string TenantId,
    string DocumentId,
    string RequestedDocumentId,
    string IdempotencyKey,
    FakeProviderScenario Scenario);
