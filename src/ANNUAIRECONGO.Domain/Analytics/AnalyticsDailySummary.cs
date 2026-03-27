
using ANNUAIRECONGO.Domain.Common;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Companies;

namespace ANNUAIRECONGO.Domain.Analytics;
public class AnalyticsDailySummary : Entity
{
    public Guid CompanyId { get; private set; }
    public DateOnly SummaryDate { get; private set; }
    public int ProfileViews { get; private set; }
    public int ContactClicks { get; private set; }
    public int SearchAppearances { get; private set; }
    public Company Company { get; private set; } = null!;

    private AnalyticsDailySummary() { }

    public static Result<AnalyticsDailySummary> Create(
        Guid companyId,
        DateOnly summaryDate,
        int profileViews,
        int contactClicks,
        int searchAppearances)
    {
        return new AnalyticsDailySummary
        {
            CompanyId = companyId,
            SummaryDate = summaryDate,
            ProfileViews = profileViews,
            ContactClicks = contactClicks,
            SearchAppearances = searchAppearances
        };
    }

    public Result<Updated> UpdateCounts(int profileViews, int contactClicks, int searchAppearances)
    {
        ProfileViews = profileViews;
        ContactClicks = contactClicks;
        SearchAppearances = searchAppearances;
        return Result.Updated;
    }
}
