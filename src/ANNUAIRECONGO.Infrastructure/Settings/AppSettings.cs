namespace ANNUAIRECONGO.Infrastructure.Settings;

public class AppSettings
{
    public string CorsPolicyName { get; set; } = default!;
    public string[] AllowedOrigins { get; set; } = default!;
    public int DefaultPageNumber { get; set; }
    public int DefaultPageSize { get; set; }
    public int LocalCacheExpirationInMins { get; set; }
    public int DistributedCacheExpirationMins { get; set; }


}