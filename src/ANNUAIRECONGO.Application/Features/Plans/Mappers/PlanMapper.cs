using ANNUAIRECONGO.Application.Features.Plans.Dtos;
using ANNUAIRECONGO.Domain.Subscriptions.Plans;

namespace ANNUAIRECONGO.Application.Features.Plans.Mappers;

public static class PlanMapper
{
    public static PlanDto ToDto(this Plan plan)
    {
        return new PlanDto(
            plan.Id,
            plan.Name,
            plan.Price,
            plan.DurationDays,
            plan.MaxImages,
            plan.MaxDocuments,
            plan.HasAnalytics,
            plan.HasFeaturedBadge,
            plan.SearchPriority,
            plan.IsActive
        );
    }
    public static List<PlanDto> ToDtos(this IEnumerable<Plan> plans)
    {
        return [..plans.Select(p => p.ToDto())];
    }
}