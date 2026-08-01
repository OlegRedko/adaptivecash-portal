using Portal.Api.Domain;

namespace Portal.Api.Application.Documents;

public interface IDocumentRepository
{
    Task<bool> ExistsAsync(string tenantId, string documentId, CancellationToken cancellationToken);

    /// <summary>Loads a tracked document so its status can be changed within the current unit of work.</summary>
    Task<DocumentRecord?> FindForUpdateAsync(
        string tenantId, string documentId, CancellationToken cancellationToken);
}
