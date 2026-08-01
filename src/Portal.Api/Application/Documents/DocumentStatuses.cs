namespace Portal.Api.Application.Documents;

/// <summary>
/// Document statuses, and how a signing session's outcome maps onto them.
/// The document mirrors the session; the session is never derived from the document.
/// </summary>
public static class DocumentStatuses
{
    public const string Draft = "Draft";
    public const string ReadyForSignature = "ReadyForSignature";
    public const string Signing = "Signing";
    public const string Verified = "Verified";
    public const string Failed = "Failed";

    /// <summary>
    /// Returns the document status for a session status, or null when the document should not move.
    /// An expired session leaves the document ready to be signed again.
    /// </summary>
    public static string? ForSessionStatus(string sessionStatus) => sessionStatus switch
    {
        "Verified" => Verified,
        "Failed" => Failed,
        "Expired" => ReadyForSignature,
        _ => null,
    };
}
