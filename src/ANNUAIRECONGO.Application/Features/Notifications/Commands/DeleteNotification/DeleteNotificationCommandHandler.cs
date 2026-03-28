using ANNUAIRECONGO.Application.Common.Interfaces;
using MediatR;
using ANNUAIRECONGO.Domain.Common.Results;
using AnnuaireCongo.Domain.Notifications;
using Microsoft.EntityFrameworkCore;

namespace ANNUAIRECONGO.Application.Features.Notifications.Commands.DeleteNotification;

public sealed class DeleteNotificationCommandHandler(
    IAppDbContext context) : IRequestHandler<DeleteNotificationCommand, Result<Success>>
{
    public async Task<Result<Success>> Handle(DeleteNotificationCommand request, CancellationToken cancellationToken)
    {
        var notification = await context.Notifications
            .FirstOrDefaultAsync(n => n.Id == request.NotificationId && n.UserId == request.UserId, cancellationToken);

        if (notification is null)
            return NotificationErrors.NotFound(request.NotificationId);

        context.Notifications.Remove(notification);

        await context.SaveChangesAsync(cancellationToken);
        return Result.Success;
    }
}