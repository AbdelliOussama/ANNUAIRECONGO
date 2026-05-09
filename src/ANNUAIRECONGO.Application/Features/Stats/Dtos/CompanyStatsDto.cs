namespace ANNUAIRECONGO.Application.Features.Stats.Dtos;

/// <summary>
/// Per-company analytics surfaced on /espace/statistiques.
///
/// Audit fix #3 (May 2026 deep audit): the FE used to render this from a mock.
/// The backend already collected raw events (ProfileView, ContactClick) and a
/// daily roll-up (AnalyticsDailySummary); this DTO exposes them.
/// </summary>
public sealed record CompanyStatsDto(
    Guid CompanyId,
    int Views,
    int UniqueVisitors,
    int ContactClicks,
    int SearchAppearances,
    IReadOnlyList<MonthlyViewBucket> Monthly);

/// <summary>One row of the 6-month bar chart on the FE statistiques page.</summary>
public sealed record MonthlyViewBucket(string Month, int Views);
