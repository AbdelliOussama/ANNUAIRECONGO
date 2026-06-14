using ANNUAIRECONGO.Application.Features.UserSubscriptions.Dtos;
using ANNUAIRECONGO.Domain.UserSubscriptions;

namespace ANNUAIRECONGO.Application.Features.UserSubscriptions.Mappers;

public static class UserSubscriptionMapper
{
    public static UserSubscriptionDto ToDto(this UserSubscription s) =>
        new(
            s.Id,
            s.UserId,
            s.PlanId,
            s.Plan?.Name.ToString() ?? string.Empty,
            s.Plan?.Price ?? 0m,
            s.Status,
            s.StartedAt,
            s.ExpiresAt
        );
}
