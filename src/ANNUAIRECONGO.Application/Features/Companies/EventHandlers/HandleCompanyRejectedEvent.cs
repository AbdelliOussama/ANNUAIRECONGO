using AnnuaireCongo.Domain.Notifications;
using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Domain.Companies.Events;
using MediatR;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Companies.EventHandlers;

public sealed class HandleCompanyRejectedEvent
    : INotificationHandler<CompanyRejectedEvent>
{
    private readonly ILogger<HandleCompanyRejectedEvent> _logger;
    private readonly IAppDbContext _context;

    public HandleCompanyRejectedEvent(
        ILogger<HandleCompanyRejectedEvent> logger,
        IAppDbContext context)
    {
        _logger = logger;
        _context = context;
    }

    public async Task Handle(
        CompanyRejectedEvent notification,
        CancellationToken cancellationToken)
    {
        var notif = Notification.Create(
            notification.OwnerId.ToString(),
            NotificationTypes.CompanyRejected,
            $"Your company '{notification.CompanyName}' was rejected: {notification.Reason}");

        if (notif.IsError)
        {
            _logger.LogError(
                "Failed to create company rejection notification for owner {OwnerId}: {Error}",
                notification.OwnerId,
                notif.Errors.First().Description);
            return;
        }

        _context.Notifications.Add(notif.Value);

        _logger.LogInformation(
            "Company rejected notification queued for owner {OwnerId}, " +
            "notification {NotificationId}",
            notification.OwnerId,
            notif.Value.Id);
    }
}