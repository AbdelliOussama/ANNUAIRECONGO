using AnnuaireCongo.Domain.Notifications;
using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Domain.Companies.Events;
using MediatR;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Companies.EventHandlers;

public sealed class HandleCompanyValidatedEvent
    : INotificationHandler<CompanyValidatedEvent>
{
    private readonly ILogger<HandleCompanyValidatedEvent> _logger;
    private readonly IAppDbContext _context;

    public HandleCompanyValidatedEvent(
        ILogger<HandleCompanyValidatedEvent> logger,
        IAppDbContext context)
    {
        _logger = logger;
        _context = context;
    }

    public async Task Handle(
        CompanyValidatedEvent notification,
        CancellationToken cancellationToken)
    {
        var notif = Notification.Create(
            notification.OwnerId,
            NotificationTypes.CompanyValidated,
            $"Your company '{notification.CompanyName}' has been approved");

        if (notif.IsError)
        {
            _logger.LogError(
                "Failed to create company validation notification for owner {OwnerId}: {Error}",
                notification.OwnerId,
                notif.Errors.First().Description);
            return;
        }

        _context.Notifications.Add(notif.Value);

        _logger.LogInformation(
            "Company validated notification queued for owner {OwnerId}, " +
            "notification {NotificationId}",
            notification.OwnerId,
            notif.Value.Id);
    }
}