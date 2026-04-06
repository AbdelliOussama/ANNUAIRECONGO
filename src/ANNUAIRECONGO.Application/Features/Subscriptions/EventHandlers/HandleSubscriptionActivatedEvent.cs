using AnnuaireCongo.Domain.Notifications;
using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Domain.Subscriptions.Events;
using MediatR;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Subscriptions.EventHandlers;

public sealed class HandleSubscriptionActivatedEvent
    : INotificationHandler<SubscriptionActivatedEvent>
{
    private readonly ILogger<HandleSubscriptionActivatedEvent> _logger;
    private readonly IAppDbContext _context;

    // IUser REMOVED — use OwnerId from the event payload instead
    public HandleSubscriptionActivatedEvent(
        ILogger<HandleSubscriptionActivatedEvent> logger,
        IAppDbContext context)
    {
        _logger = logger;
        _context = context;
    }

    public async Task Handle(
        SubscriptionActivatedEvent notification,
        CancellationToken cancellationToken)
    {
        // Use OwnerId from the event, NOT from IUser
        var notif = Notification.Create(
            notification.OwnerId,
            NotificationTypes.SubscriptionActivated,
            $"Your subscription for plan {notification.PlanName} has been activated " +
            $"and will expire on {notification.ExpiresAt:yyyy-MM-dd}.");

        if (notif.IsError)
        {
            _logger.LogError(
                "Failed to create subscription activation notification for owner {OwnerId}: {Error}",
                notification.OwnerId,
                notif.Errors.First().Description);
            return;
        }

        _context.Notifications.Add(notif.Value);
        // Do NOT call SaveChangesAsync here.
        // The outer SaveChangesAsync in AppDbContext will persist this
        // in the same transaction as the subscription activation.

        _logger.LogInformation(
            "Subscription activated notification queued for owner {OwnerId}, " +
            "notification {NotificationId}",
            notification.OwnerId,
            notif.Value.Id);
    }
}