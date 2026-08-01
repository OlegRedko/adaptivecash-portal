namespace Portal.Api.Domain;

public sealed class DocumentRecord
{
    public string Id { get; set; } = "";
    public string TenantId { get; set; } = "";
    public string Title { get; set; } = "";
    public string Status { get; set; } = "Draft";
    public string Signer { get; set; } = "";
    public string ContentType { get; set; } = "application/pdf";
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}

public sealed class SigningSessionRecord
{
    public string Id { get; set; } = "";
    public string TenantId { get; set; } = "";
    public string DocumentId { get; set; } = "";
    public string Status { get; set; } = "Pending";
    public string Provider { get; set; } = "Fake Qualified Provider";
    public string ProviderReference { get; set; } = "";
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset ExpiresAt { get; set; }
}

public sealed class IdempotencyRecord
{
    public long Id { get; set; }
    public string TenantId { get; set; } = "";
    public string DocumentId { get; set; } = "";
    public string Operation { get; set; } = "CreateSigningSession";
    public string Key { get; set; } = "";
    public string RequestHash { get; set; } = "";
    public string? SigningSessionId { get; set; }
    public string Status { get; set; } = "Received";
    public DateTimeOffset CreatedAt { get; set; }
}