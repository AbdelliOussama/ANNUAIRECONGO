using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Features.Plans.Dtos;
using ANNUAIRECONGO.Application.Features.Plans.Mappers;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Subscriptions.Plans;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Plans.Queries.GetPlans;

public sealed class GetPlansQueryHandler(
    IAppDbContext context,ILogger<GetPlansQueryHandler>logger) : IRequestHandler<GetPlansQuery, Result<List<PlanDto>>>
{
    private readonly IAppDbContext _context = context;
    private readonly ILogger<GetPlansQueryHandler> _logger = logger;
    public async Task<Result<List<PlanDto>>> Handle(GetPlansQuery request, CancellationToken cancellationToken)
    {
        var plans = await _context.Plans
            .AsNoTracking()
            .ToListAsync(cancellationToken);
        if(plans == null || !plans.Any())
        {
            _logger.LogWarning("No plans found in the database.");
            return PlanErrors.NoPlansFound;
        }
        return plans.ToDtos();
    }
}