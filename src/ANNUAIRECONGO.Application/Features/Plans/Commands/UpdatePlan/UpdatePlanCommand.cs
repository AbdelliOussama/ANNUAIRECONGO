using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Subscriptions.Plans.Enums;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.Plans.Commands.UpdatePlan;

public sealed record UpdatePlanCommand(
    Guid Id,
    PlanName Name,
    decimal Price,
    int DurationDays,
    int MaxImages,
    int MaxDocuments,
    bool HasAnalytics,
    bool HasFeaturedBadge,
    int SearchPriority) : IRequest<Result<Updated>>;