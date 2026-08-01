using Microsoft.EntityFrameworkCore;
using Portal.Api.Application.Signing;
using Portal.Api.Data;

namespace Portal.Api.Infrastructure.Repositories;

public sealed class UnitOfWork(PortalDbContext db) : IUnitOfWork
{
    public async Task<bool> TryCommitAsync(CancellationToken cancellationToken)
    {
        try
        {
            await db.SaveChangesAsync(cancellationToken);
            return true;
        }
        catch (DbUpdateException)
        {
            db.ChangeTracker.Clear();
            return false;
        }
    }
}
