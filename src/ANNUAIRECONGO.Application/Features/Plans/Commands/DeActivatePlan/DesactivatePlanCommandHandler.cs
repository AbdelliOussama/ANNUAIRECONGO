using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Logs;
using ANNUAIRECONGO.Domain.Subscriptions.Plans;
using MediatR;
using Microsoft.Extensions.Caching.Hybrid;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Plans.Commands.DeActivatePlan;

public sealed record DeActivatePlanCommandHandler(IAppDbContext Context, ILogger<DeActivatePlanCommandHandler> logger, HybridCache cache, IUser CurrentUser) : IRequestHandler<DeActivatePlanCommand, Result<Updated>>
{
    private readonly IAppDbContext _context = Context;
    private readonly ILogger<DeActivatePlanCommandHandler> _logger = logger;
    private readonly HybridCache _cache = cache;
    private readonly IUser _currentUser = CurrentUser;
    public async Task<Result<Updated>> Handle(DeActivatePlanCommand request, CancellationToken cancellationToken)
    {
        var plan = _context.Plans.FirstOrDefault(p => p.Id == request.PlanId);
        if(plan is null )
        {
            _logger.LogWarning("Plan with id {PlanId} not found for deactivation.", request.PlanId);
            return PlanErrors.NotFound(request.PlanId);
        }
        plan.Deactivate();

        var adminLogResult = AdminLog.Create(
            _currentUser.Id,
            "deactivated_plan",
            AdminTargetTypes.Plan,
            plan.Id,
            $"Plan '{plan.Name}' deactivated by admin");

        if (!adminLogResult.IsError)
            await _context.AdminLogs.AddAsync(adminLogResult.Value, cancellationToken);
        else
            _logger.LogWarning("Could not create admin log for DeActivatePlan {PlanId}", request.PlanId);

        await _context.SaveChangesAsync(cancellationToken);
        await _cache.RemoveByTagAsync("plans", cancellationToken);
        _logger.LogInformation("Plan with id {PlanId} deactivated successfully.", request.PlanId);
        return Result.Updated;
    }
}