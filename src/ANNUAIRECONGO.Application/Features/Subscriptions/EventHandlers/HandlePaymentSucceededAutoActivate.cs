using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Domain.Subscriptions.Events;
using ANNUAIRECONGO.Domain.Subscriptions.Payments.Events;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Subscriptions.EventHandlers;

public sealed class HandlePaymentSucceededAutoActivate(
    IAppDbContext context,
    ILogger<HandlePaymentSucceededAutoActivate> logger)
    : INotificationHandler<PaymentSucceededEvent>
{
    public async Task Handle(PaymentSucceededEvent notification, CancellationToken ct)
    {
        // Load subscription with company
        var subscription = await context.Subscriptions
            .Include(s => s.Company)
            .Include(s => s.Plan)
            .FirstOrDefaultAsync(s => s.Id == notification.SubscriptionId, ct);

        if (subscription is null)
        {
            logger.LogError("Subscription {Id} not found after payment succeeded",
                notification.SubscriptionId);
            return;
        }

        // Activate subscription
        var activateResult = subscription.Activate();
        if (activateResult.IsError)
        {
            logger.LogError("Could not activate subscription {Id}: {Error}",
                subscription.Id, activateResult.TopError.Description);
            return;
        }

        // Set as company's active subscription
        subscription.Company.SetActiveSubscription(subscription.Id);

        // Dispatch activation event for notifications
        subscription.AddDomainEvent(new SubscriptionActivatedEvent(
            subscription.Id, subscription.CompanyId,
            subscription.Company.OwnerId.ToString(),
            subscription.Plan.Name.ToString(),
            subscription.ExpiresAt));

        await context.SaveChangesAsync(ct);
        logger.LogInformation(
            "Subscription {SubId} activated for Company {CompId} after payment success",
            subscription.Id, subscription.CompanyId);
    }
}