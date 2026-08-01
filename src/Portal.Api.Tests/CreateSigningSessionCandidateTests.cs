namespace Portal.Api.Tests;
public sealed class CreateSigningSessionCandidateTests {
 [Fact(Skip="Candidate TODO: enable after implementing POST")] public Task Concurrent_same_key_creates_one_session()=>Task.CompletedTask;
 [Fact(Skip="Candidate TODO: enable after implementing POST")] public Task Same_key_different_payload_returns_409()=>Task.CompletedTask;
 [Fact(Skip="Candidate TODO: enable after implementing POST")] public Task Durable_record_survives_new_service_scope()=>Task.CompletedTask;
}
