using Portal.Api.Contracts;

namespace Portal.Api.Application.Signing;

public sealed record CreateSigningSessionResult
{
    private CreateSigningSessionResult(
        CreateSigningSessionOutcome outcome,
        SigningSessionDto? session,
        string? existingSessionId)
    {
        Outcome = outcome;
        Session = session;
        ExistingSessionId = existingSessionId;
    }

    public CreateSigningSessionOutcome Outcome { get; }

    public SigningSessionDto? Session { get; }

    public string? ExistingSessionId { get; }

    public static CreateSigningSessionResult Created(SigningSessionDto session) =>
        new(CreateSigningSessionOutcome.Created, session, null);

    public static CreateSigningSessionResult AlreadyCreated(SigningSessionDto session) =>
        new(CreateSigningSessionOutcome.AlreadyCreated, session, null);

    public static CreateSigningSessionResult ActiveSessionExists(string existingSessionId) =>
        new(CreateSigningSessionOutcome.ActiveSessionExists, null, existingSessionId);

    public static CreateSigningSessionResult Failed(CreateSigningSessionOutcome outcome) =>
        new(outcome, null, null);
}
