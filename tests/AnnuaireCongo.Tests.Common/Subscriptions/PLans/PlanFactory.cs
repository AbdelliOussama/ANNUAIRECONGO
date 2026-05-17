using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Subscriptions.Plans;
using ANNUAIRECONGO.Domain.Subscriptions.Plans.Enums;

namespace AnnuaireCongo.Tests.Common.Subscriptions.PLans;

public static class PlanFactory
{
    public static Result<Plan> CreatePlan(Guid? id = null, PlanName? name = null, decimal? price = null, int? durationDays = null, int? maxImages = null, int? maxDocuments = null, bool? hasAnalytics = null, bool? hasFeaturedBadge = null, int? searchPriority = null)
    {
        return Plan.Create(
            id ?? Guid.NewGuid(),
            name ?? PlanName.Free,
            price ?? 9.99m,
            durationDays ?? 30,
            maxImages ?? 10,
            maxDocuments ?? 5,
            hasAnalytics ?? true,
            hasFeaturedBadge ?? false,
            searchPriority ?? 2
        );
    }
}
