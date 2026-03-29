using ANNUAIRECONGO.Application.Common.Interfaces;
using MediatR;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Subscriptions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Caching.Hybrid;
using ANNUAIRECONGO.Domain.Subscriptions.Events;

namespace ANNUAIRECONGO.Application.Features.Subscriptions.Commands.CancelSubscription;

public sealed class CancelSubscriptionCommandHandler(ILogger<CancelSubscriptionCommandHandler>logger,HybridCache cache,
    IAppDbContext context) : IRequestHandler<CancelSubscriptionCommand, Result<Updated>>
{
    private readonly ILogger<CancelSubscriptionCommandHandler> _logger = logger;
    private readonly IAppDbContext _context = context;
    private readonly HybridCache _cache = cache;


    public async Task<Result<Updated>> Handle(CancelSubscriptionCommand request, CancellationToken cancellationToken)
    {
        var subscription = await _context.Subscriptions
            .Include(s => s.Company)
            .FirstOrDefaultAsync(s => s.Id == request.SubscriptionId, cancellationToken);

        if (subscription is null)
        {
            logger.LogWarning("Subscription with ID {SubscriptionId} not found for cancellation.", request.SubscriptionId);
            return SubscriptionErrors.NotFound(request.SubscriptionId);
        }

        var cancelResult = subscription.Cancel();
        if (cancelResult.IsError)
        {
            _logger.LogWarning("Failed to cancel subscription with ID {SubscriptionId}: {ErrorMessage}", request.SubscriptionId, cancelResult.Errors.First().Description);
            return cancelResult.Errors;
        }
        subscription.AddDomainEvent(new SubscriptionCancelledEvent(subscription.Id, subscription.CompanyId,subscription.Company.OwnerId.ToString()));
        _logger.LogInformation("Subscription with ID {SubscriptionId} cancelled successfully.", request.SubscriptionId);
        await _context.SaveChangesAsync(cancellationToken);
        return Result.Updated;
    }
}