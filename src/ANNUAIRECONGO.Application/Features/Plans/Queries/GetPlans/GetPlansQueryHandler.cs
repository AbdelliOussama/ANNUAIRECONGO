using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Features.Plans.Dtos;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Subscriptions.Plans;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ANNUAIRECONGO.Application.Features.Plans.Queries.GetPlans;

public sealed class GetPlansQueryHandler(
    IAppDbContext context) : IRequestHandler<GetPlansQuery, Result<List<PlanDto>>>
{
    public async Task<Result<List<PlanDto>>> Handle(GetPlansQuery request, CancellationToken cancellationToken)
    {
        var plans = await context.Plans
            .AsNoTracking()
            .Select(p => new PlanDto(
                p.Id,
                p.Name,
                p.Price,
                p.DurationDays,
                p.MaxImages,
                p.MaxDocuments,
                p.HasAnalytics,
                p.HasFeaturedBadge,
                p.SearchPriority))
            .ToListAsync(cancellationToken);

        return plans;
    }
}