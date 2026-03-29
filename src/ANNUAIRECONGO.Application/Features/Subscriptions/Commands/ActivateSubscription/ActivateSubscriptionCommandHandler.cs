using ANNUAIRECONGO.Application.Features.Subscriptions.Dtos;
using ANNUAIRECONGO.Application.Common.Interfaces;
using MediatR;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Subscriptions;
using ANNUAIRECONGO.Domain.Subscriptions.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Caching.Hybrid;
using ANNUAIRECONGO.Domain.Subscriptions.Events;
using ANNUAIRECONGO.Application.Features.Subscriptions.Mappers;

namespace ANNUAIRECONGO.Application.Features.Subscriptions.Commands.ActivateSubscription;

public sealed class ActivateSubscriptionCommandHandler(
    IAppDbContext context,ILogger<ActivateSubscriptionCommandHandler>logger,HybridCache cache) : IRequestHandler<ActivateSubscriptionCommand, Result<SubscriptionDto>>
{
    private readonly IAppDbContext _context = context;
    private readonly ILogger<ActivateSubscriptionCommandHandler> _logger = logger;
    private readonly HybridCache _cache = cache;
    public async Task<Result<SubscriptionDto>> Handle(ActivateSubscriptionCommand request, CancellationToken cancellationToken)
    {
        var subscription = await _context.Subscriptions.Include(s => s.Plan).Include(s => s.Company)
            .FirstOrDefaultAsync(s => s.Id == request.SubscriptionId, cancellationToken);

        if (subscription is null)
        {
            _logger.LogWarning("Subscription with ID {SubscriptionId} not found.", request.SubscriptionId);
            return SubscriptionErrors.NotFound(request.SubscriptionId);
        }

        var activateResult = subscription.Activate();
        if (activateResult.IsError)
        {
            _logger.LogWarning("Failed to activate subscription with ID {SubscriptionId}. Reason: {Reason}", request.SubscriptionId, activateResult.Errors.First().Description);
            return activateResult.Errors.First();
        }
        subscription.AddDomainEvent(new SubscriptionActivatedEvent(subscription.Id, subscription.CompanyId,subscription.Company.OwnerId.ToString(),subscription.Plan.Name.ToString(), subscription.ExpiresAt));
        await _context.SaveChangesAsync(cancellationToken);
        await _cache.RemoveByTagAsync("subscriptions", cancellationToken);
        return subscription.ToDto();
    }
}