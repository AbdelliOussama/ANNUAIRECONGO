using ANNUAIRECONGO.Domain.Subscriptions.Enums;

namespace ANNUAIRECONGO.Application.Features.UserSubscriptions.Dtos;

public sealed record UserSubscriptionDto(
    Guid              Id,
    Guid              UserId,
    Guid              PlanId,
    string            PlanName,
    decimal           PlanPrice,
    SubscriptionStatus Status,
    DateTimeOffset    StartedAt,
    DateTimeOffset    ExpiresAt
);
