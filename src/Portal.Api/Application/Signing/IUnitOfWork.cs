namespace Portal.Api.Application.Signing;

public interface IUnitOfWork
{
    /// <summary>Commits pending changes. Returns false when a uniqueness constraint rejected them.</summary>
    Task<bool> TryCommitAsync(CancellationToken cancellationToken);
}
