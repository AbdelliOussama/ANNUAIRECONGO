using ANNUAIRECONGO.Domain.Subscriptions;
using ANNUAIRECONGO.Domain.Subscriptions.Plans;
using ANNUAIRECONGO.Domain.Subscriptions.Enums;

namespace ANNUAIRECONGO.Application.Features.Subscriptions.Dtos;

public sealed record SubscriptionDto(
    Guid Id,
    Guid CompanyId,
    Guid PlanId,
    string PlanName,
    SubscriptionStatus Status,
    DateTime StartedAt,
    DateTime ExpiresAt,
    bool IsActive);