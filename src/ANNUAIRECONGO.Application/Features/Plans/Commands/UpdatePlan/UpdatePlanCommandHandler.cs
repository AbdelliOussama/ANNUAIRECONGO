using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Subscriptions.Plans;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Hybrid;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Plans.Commands.UpdatePlan;

public sealed record UpdatePlanCommandHandler(IAppDbContext Context, ILogger<UpdatePlanCommandHandler> Logger,HybridCache cache) : IRequestHandler<UpdatePlanCommand, Result<Updated>>
{
    private readonly IAppDbContext _context = Context;
    private readonly ILogger<UpdatePlanCommandHandler> _logger = Logger;
    private readonly HybridCache _cache = cache;

    public async Task<Result<Updated>> Handle(UpdatePlanCommand request, CancellationToken ct)
    {
        var plan = await _context.Plans.FirstOrDefaultAsync(p => p.Id == request.Id,ct);
        if (plan is null)
        {
            _logger.LogWarning("Plan with ID {PlanId} not found for update.", request.Id);
            return PlanErrors.NotFound(request.Id);
        }
        var UpdateResult = plan.Update(
            request.Name,
            request.Price,
            request.DurationDays,
            request.MaxImages,
            request.MaxDocuments,
            request.HasAnalytics,
            request.HasFeaturedBadge,
            request.SearchPriority);
        if(UpdateResult.IsError)
        {
            _logger.LogWarning("Failed to update plan with ID {PlanId}. Reason: {Reason}", request.Id, UpdateResult.Errors.First().Description);
            return UpdateResult.Errors.First();
        }
        await _context.SaveChangesAsync(ct);
        await _cache.RemoveByTagAsync("plans", ct); // Invalidate cache for plans
        _logger.LogInformation("Plan with ID {PlanId} updated successfully.", request.Id);
        return Result.Updated;
    }
}