using System;

namespace ANNUAIRECONGO.Application.Common.Models;

public class SectorIntelligenceReport
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string SectorName { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string Excerpt { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
    public string Date { get; set; } = string.Empty;
    public DateTimeOffset GeneratedAt { get; set; }
}
