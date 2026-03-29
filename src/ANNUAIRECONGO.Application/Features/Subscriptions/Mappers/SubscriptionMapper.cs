using ANNUAIRECONGO.Application.Features.Subscriptions.Dtos;
using ANNUAIRECONGO.Domain.Subscriptions;
using ANNUAIRECONGO.Domain.Subscriptions.Enums;

namespace ANNUAIRECONGO.Application.Features.Subscriptions.Mappers;

public static class SubscriptionMapper
{
    public static SubscriptionDto ToDto(this Subscription subscription)
    {
        return new SubscriptionDto(
            subscription.Id,
            subscription.CompanyId,
            subscription.PlanId,
            subscription.Plan.Name.ToString(),
            subscription.Status,
            subscription.StartedAt,
            subscription.ExpiresAt,
            subscription.Status == SubscriptionStatus.Active || subscription.Status == SubscriptionStatus.ExpiringSoon
        );
    }
    public static List<SubscriptionDto> ToDtos(this IEnumerable<Subscription> subscriptions)
    {
        return [..subscriptions.Select(s => s.ToDto())];
    }
}