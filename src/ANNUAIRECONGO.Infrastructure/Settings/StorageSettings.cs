namespace ANNUAIRECONGO.Infrastructure;

/// <summary>
/// Bound from appsettings.json "StorageSettings" section.
/// </summary>
public sealed class StorageSettings
{
    public const string SectionName = "StorageSettings";

    /// <summary>
    /// Public base URL of the API host, used to build file URLs.
    /// E.g. "https://localhost:7001"  or  "https://api.annuaire-congo.cg"
    /// </summary>
    public string BaseUrl { get; init; } = string.Empty;

    /// <summary>Maximum allowed upload size in bytes. Default: 10 MB.</summary>
    public long MaxFileSizeBytes { get; init; } = 10 * 1024 * 1024;
}
