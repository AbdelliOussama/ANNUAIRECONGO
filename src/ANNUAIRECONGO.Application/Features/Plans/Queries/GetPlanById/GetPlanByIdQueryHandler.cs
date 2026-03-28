using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Features.Plans.Dtos;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Subscriptions.Plans;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ANNUAIRECONGO.Application.Features.Plans.Queries.GetPlanById;

public sealed class GetPlanByIdQueryHandler(
    IAppDbContext context) : IRequestHandler<GetPlanByIdQuery, Result<PlanDto>>
{
    public async Task<Result<PlanDto>> Handle(GetPlanByIdQuery request, CancellationToken cancellationToken)
    {
        var plan = await context.Plans
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

        if (plan is null)
            return PlanErrors.NotFound(request.Id);

        return new PlanDto(
            plan.Id,
            plan.Name,
            plan.Price,
            plan.DurationDays,
            plan.MaxImages,
            plan.MaxDocuments,
            plan.HasAnalytics,
            plan.HasFeaturedBadge,
            plan.SearchPriority);
    }
}