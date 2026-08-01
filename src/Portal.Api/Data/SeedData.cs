using Microsoft.EntityFrameworkCore;
using Portal.Api.Domain;

namespace Portal.Api.Data;

public static class SeedData
{
    public static async Task EnsureSeededAsync(PortalDbContext db)
    {
        await db.Database.EnsureCreatedAsync();
        if (await db.Documents.AnyAsync()) return;
        var now = DateTimeOffset.UtcNow;
        db.Documents.AddRange(
            new DocumentRecord
            {
                TenantId = "branch-demo", Id = "BR-DOC-001", Title = "Branch cash collection order",
                Status = "ReadyForSignature", Signer = "Olena Kovalenko", CreatedAt = now.AddDays(-10),
                UpdatedAt = now.AddHours(-2)
            },
            new DocumentRecord
            {
                TenantId = "branch-demo", Id = "BR-DOC-002", Title = "Daily cash balance statement",
                Status = "Verified", Signer = "Andrii Melnyk", CreatedAt = now.AddDays(-12), UpdatedAt = now.AddDays(-1)
            },
            new DocumentRecord
            {
                TenantId = "branch-demo", Id = "BR-DOC-003", Title = "Cash replenishment request", Status = "Draft",
                Signer = "Iryna Bondar", CreatedAt = now.AddDays(-1), UpdatedAt = now.AddHours(-4)
            },
            new DocumentRecord
            {
                TenantId = "customer-demo", Id = "CU-DOC-001", Title = "Customer collection request",
                Status = "ReadyForSignature", Signer = "Customer Operator", CreatedAt = now.AddDays(-5),
                UpdatedAt = now.AddHours(-1)
            },
            new DocumentRecord
            {
                TenantId = "customer-demo", Id = "CU-DOC-002", Title = "Customer statement", Status = "Verified",
                Signer = "Customer Operator", CreatedAt = now.AddDays(-7), UpdatedAt = now.AddDays(-2)
            });
        await db.SaveChangesAsync();
    }
}