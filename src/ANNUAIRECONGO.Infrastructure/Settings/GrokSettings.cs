namespace ANNUAIRECONGO.Infrastructure;

public sealed class GrokSettings
{
    public const string SectionName = "GrokSettings";

    public string ApiKey { get; init; } = string.Empty;
    public string Model { get; init; } = "llama-3.3-70b-versatile";
}
