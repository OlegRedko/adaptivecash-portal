using Microsoft.EntityFrameworkCore;
using Portal.Api.Data;
using Portal.Api.Endpoints;
using Portal.Api.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddProblemDetails();

builder.Services.AddOpenApi();
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<TenantContext>();
builder.Services.AddDbContext<PortalDbContext>(o =>
    o.UseSqlite(builder.Configuration.GetConnectionString("Portal") ?? "Data Source=portal-takehome.db"));
builder.Services.AddSingleton<IFakeSignatureProvider, FakeSignatureProvider>();

var app = builder.Build();
app.UseExceptionHandler();
if (app.Environment.IsDevelopment())
    app.MapOpenApi();

using (var scope = app.Services.CreateScope())
    await SeedData.EnsureSeededAsync(scope.ServiceProvider.GetRequiredService<PortalDbContext>());

app.MapGet("/health", () => Results.Ok(new { status = "ok" }));
app.MapDocumentEndpoints().MapSigningSessionEndpoints().MapCreateSigningSessionEndpoint();

app.Run();

public partial class Program
{
}