using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;

namespace Portal.Api.Tests;

/// <summary>
/// Hosts the API against a database of its own.
///
/// Program.cs reads the "Portal" connection string from configuration, so pointing that at a
/// throwaway file keeps a test run away from the development database and from other tests.
/// A file rather than an in-memory database, because the durability test needs state to
/// survive a new service scope.
/// </summary>
public sealed class PortalApiFactory : WebApplicationFactory<Program>
{
    private readonly string databasePath =
        Path.Combine(Path.GetTempPath(), $"portal-tests-{Guid.NewGuid():N}.db");

    public HttpClient CreateClientFor(string tenantId)
    {
        var client = CreateClient();
        client.DefaultRequestHeaders.Add("X-Tenant-Id", tenantId);
        return client;
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder) =>
        builder.UseSetting("ConnectionStrings:Portal", $"Data Source={databasePath}");

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        if (!disposing) return;

        foreach (var path in new[] { databasePath, $"{databasePath}-shm", $"{databasePath}-wal" })
        {
            try
            {
                if (File.Exists(path)) File.Delete(path);
            }
            catch (IOException)
            {
                // A still-open SQLite handle keeps the file locked; the temp directory can have it.
            }
        }
    }
}
