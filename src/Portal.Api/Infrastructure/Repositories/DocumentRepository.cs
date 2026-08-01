using Microsoft.EntityFrameworkCore;
using Portal.Api.Application.Documents;
using Portal.Api.Data;
using Portal.Api.Domain;

namespace Portal.Api.Infrastructure.Repositories;

public sealed class DocumentRepository(PortalDbContext db) : IDocumentRepository
{
    public Task<bool> ExistsAsync(string tenantId, string documentId, CancellationToken cancellationToken) =>
        db.Documents.AsNoTracking()
            .AnyAsync(x => x.TenantId == tenantId && x.Id == documentId, cancellationToken);

    public Task<DocumentRecord?> FindForUpdateAsync(
        string tenantId, string documentId, CancellationToken cancellationToken) =>
        db.Documents.SingleOrDefaultAsync(
            x => x.TenantId == tenantId && x.Id == documentId, cancellationToken);
}
