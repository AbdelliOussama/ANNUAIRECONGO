using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Features.Plans.Dtos;
using ANNUAIRECONGO.Application.Features.Plans.Mappers;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Subscriptions.Plans;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Plans.Queries.GetPlanById;

public sealed class GetPlanByIdQueryHandler(
    IAppDbContext context,ILogger<GetPlanByIdQueryHandler> logger) : IRequestHandler<GetPlanByIdQuery, Result<PlanDto>>
{
    private readonly ILogger<GetPlanByIdQueryHandler> _logger = logger;
    private readonly IAppDbContext _context = context;
    public async Task<Result<PlanDto>> Handle(GetPlanByIdQuery request, CancellationToken cancellationToken)
    {
        var plan = await _context.Plans
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

        if (plan is null)
        {
            _logger.LogWarning("Plan with ID {PlanId} not found", request.Id);
            return PlanErrors.NotFound(request.Id);
        }
        return plan.ToDto();
    }
}