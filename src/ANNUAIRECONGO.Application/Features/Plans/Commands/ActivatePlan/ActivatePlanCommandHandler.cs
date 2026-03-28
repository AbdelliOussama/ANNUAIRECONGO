using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Subscriptions.Plans;
using MediatR;
using Microsoft.Extensions.Caching.Hybrid;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Plans.Commands.ActivatePlan;

public sealed record ActivatePlanCommandHandler(ILogger<ActivatePlanCommandHandler> logger, IAppDbContext context, HybridCache cache) : IRequestHandler<ActivatePlanCommand, Result<Updated>>
{
    private readonly ILogger<ActivatePlanCommandHandler> _logger = logger;
    private readonly IAppDbContext _context = context;
    private readonly HybridCache _cache = cache;

    public async Task<Result<Updated>> Handle(ActivatePlanCommand request, CancellationToken cancellationToken)
    {
        var plan = _context.Plans.FirstOrDefault(p => p.Id == request.PlanId);
        if (plan is null)
        {
            _logger.LogWarning("Attempted to activate non-existent plan with ID {PlanId}", request.PlanId);
            return PlanErrors.NotFound(request.PlanId);
        }
        plan.Activate();
        await _context.SaveChangesAsync(cancellationToken);
        await _cache.RemoveByTagAsync("plans", cancellationToken);
        return Result.Updated;
    }
}