using System.Security.Cryptography;
using System.Text;

namespace Portal.Api.Application.Signing;

/// <summary>
/// Derives the values that make one signing attempt identifiable: the fingerprint used to
/// detect a reused key, and the deterministic session id that makes a duplicate insert collide.
/// </summary>
public static class SigningSessionIdentity
{
    public const string Operation = "CreateSigningSession";

    public static string Fingerprint(CreateSigningSessionCommand command) =>
        Hash(command.TenantId, command.DocumentId, command.RequestedDocumentId);

    public static string SessionId(CreateSigningSessionCommand command) =>
        $"SIGN-{Hash(command.TenantId, command.DocumentId, command.IdempotencyKey)[..16]}";

    private static string Hash(params string?[] parts) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(string.Join('|', parts))));
}
