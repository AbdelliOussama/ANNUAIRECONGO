using AnnuaireCongo.Domain.Notifications;
using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Domain.Companies.Events;
using MediatR;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Companies.EventHandlers;

public sealed class HandleCompanyReactivatedEvent
    : INotificationHandler<CompanyReactivatedEvent>
{
    private readonly ILogger<HandleCompanyReactivatedEvent> _logger;
    private readonly IAppDbContext _context;

    public HandleCompanyReactivatedEvent(
        ILogger<HandleCompanyReactivatedEvent> logger,
        IAppDbContext context)
    {
        _logger = logger;
        _context = context;
    }

    public async Task Handle(
        CompanyReactivatedEvent notification,
        CancellationToken cancellationToken)
    {
        var notif = Notification.Create(
            notification.OwnerId.ToString(),
            NotificationTypes.CompanyReactivated,
            $"Your company '{notification.CompanyName}' has been reactivated");

        if (notif.IsError)
        {
            _logger.LogError(
                "Failed to create company reactivation notification for owner {OwnerId}: {Error}",
                notification.OwnerId,
                notif.Errors.First().Description);
            return;
        }

        _context.Notifications.Add(notif.Value);

        _logger.LogInformation(
            "Company reactivated notification queued for owner {OwnerId}, " +
            "notification {NotificationId}",
            notification.OwnerId,
            notif.Value.Id);
    }
}