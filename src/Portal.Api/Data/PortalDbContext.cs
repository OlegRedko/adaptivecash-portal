using Microsoft.EntityFrameworkCore;
using Portal.Api.Domain;

namespace Portal.Api.Data;

public sealed class PortalDbContext(DbContextOptions<PortalDbContext> options) : DbContext(options)
{
    public DbSet<DocumentRecord> Documents => Set<DocumentRecord>();
    public DbSet<SigningSessionRecord> SigningSessions => Set<SigningSessionRecord>();
    public DbSet<IdempotencyRecord> IdempotencyRecords => Set<IdempotencyRecord>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<DocumentRecord>().HasKey(x => new { x.TenantId, x.Id });
        b.Entity<SigningSessionRecord>().HasKey(x => new { x.TenantId, x.Id });
        b.Entity<SigningSessionRecord>().HasIndex(x => new { x.TenantId, x.DocumentId, x.Status });
        b.Entity<IdempotencyRecord>().HasIndex(x => new { x.TenantId, x.Operation, x.Key }).IsUnique();
    }
}