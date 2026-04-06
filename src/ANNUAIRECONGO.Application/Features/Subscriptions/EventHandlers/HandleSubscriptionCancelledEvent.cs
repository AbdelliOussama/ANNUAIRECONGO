using AnnuaireCongo.Domain.Notifications;
using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Domain.Subscriptions.Events;
using MediatR;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Subscriptions.EventHandlers;

public sealed class HandleSubscriptionCancelledEvent
    : INotificationHandler<SubscriptionCancelledEvent>
{
    private readonly ILogger<HandleSubscriptionCancelledEvent> _logger;
    private readonly IAppDbContext _context;

    public HandleSubscriptionCancelledEvent(
        ILogger<HandleSubscriptionCancelledEvent> logger,
        IAppDbContext context)
    {
        _logger = logger;
        _context = context;
    }

    public async Task Handle(
        SubscriptionCancelledEvent notification,
        CancellationToken cancellationToken)
    {
        var notif = Notification.Create(
            notification.OwnerId,
            NotificationTypes.SubscriptionCancelled,
            "Your subscription has been cancelled");

        if (notif.IsError)
        {
            _logger.LogError(
                "Failed to create subscription cancellation notification for owner {OwnerId}: {Error}",
                notification.OwnerId,
                notif.Errors.First().Description);
            return;
        }

        _context.Notifications.Add(notif.Value);

        _logger.LogInformation(
            "Subscription cancelled notification queued for owner {OwnerId}, " +
            "notification {NotificationId}",
            notification.OwnerId,
            notif.Value.Id);
    }
}