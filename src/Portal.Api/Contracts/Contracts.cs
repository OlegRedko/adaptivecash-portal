namespace Portal.Api.Contracts;

public sealed record DocumentSummaryDto(
    string Id,
    string Title,
    string Status,
    string Signer,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);

public sealed record DocumentDetailDto(
    string Id,
    string Title,
    string Status,
    string Signer,
    string ContentType,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt,
    SigningSessionDto? SigningSession);

public sealed record SigningSessionDto(
    string Id,
    string DocumentId,
    string Status,
    string Provider,
    DateTimeOffset CreatedAt,
    DateTimeOffset ExpiresAt);

public sealed record CreateSigningSessionBody(string DocumentId);