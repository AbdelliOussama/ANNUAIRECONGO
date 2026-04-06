using AnnuaireCongo.Domain.Notifications;
using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Domain.Companies.Events;
using MediatR;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Companies.EventHandlers;

public sealed class HandleCompanySuspendedEvent
    : INotificationHandler<CompanySuspendedEvent>
{
    private readonly ILogger<HandleCompanySuspendedEvent> _logger;
    private readonly IAppDbContext _context;

    public HandleCompanySuspendedEvent(
        ILogger<HandleCompanySuspendedEvent> logger,
        IAppDbContext context)
    {
        _logger = logger;
        _context = context;
    }

    public async Task Handle(
        CompanySuspendedEvent notification,
        CancellationToken cancellationToken)
    {
        var notif = Notification.Create(
            notification.OwnerId,
            NotificationTypes.CompanySuspended,
            $"Your company '{notification.CompanyName}' has been suspended");

        if (notif.IsError)
        {
            _logger.LogError(
                "Failed to create company suspension notification for owner {OwnerId}: {Error}",
                notification.OwnerId,
                notif.Errors.First().Description);
            return;
        }

        _context.Notifications.Add(notif.Value);

        _logger.LogInformation(
            "Company suspended notification queued for owner {OwnerId}, " +
            "notification {NotificationId}",
            notification.OwnerId,
            notif.Value.Id);
    }
}