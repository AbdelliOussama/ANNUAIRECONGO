using ANNUAIRECONGO.Domain.Analytics;
using ANNUAIRECONGO.Domain.Common.Results;

namespace AnnuaireCongo.Tests.Common.Analytics;

public static class AnalyticsDailySummaryFactory
{
    public static Result<AnalyticsDailySummary> CreateAnalyticsDailySummary(
        Guid? companyId = null,
        DateOnly? summaryDate = null,
        int? profileViews = null,
        int? contactClicks = null,
        int? searchAppearances = null)
    {
        return AnalyticsDailySummary.Create(
            companyId ?? Guid.NewGuid(),
            summaryDate ?? DateOnly.FromDateTime(DateTime.UtcNow),
            profileViews ?? 42,
            contactClicks ?? 7,
            searchAppearances ?? 120
        );
    }
}
