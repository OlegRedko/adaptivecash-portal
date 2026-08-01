namespace Portal.Api.Infrastructure;

public sealed class TenantContext(IHttpContextAccessor accessor)
{
    public string RequireTenant()
    {
        var tenant = accessor.HttpContext?.Request.Headers["X-Tenant-Id"].ToString();
        if (string.IsNullOrWhiteSpace(tenant)) throw new BadHttpRequestException("X-Tenant-Id is required.");
        return tenant;
    }
}