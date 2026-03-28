using ANNUAIRECONGO.Domain.Subscriptions.Plans.Enums;

namespace ANNUAIRECONGO.Application.Features.Plans.Dtos;

public sealed record PlanDto(
    Guid Id,
    PlanName Name,
    decimal Price,
    int DurationDays,
    int MaxImages,
    int MaxDocuments,
    bool HasAnalytics,
    bool HasFeaturedBadge,
    int SearchPriority,
    bool IsActive);