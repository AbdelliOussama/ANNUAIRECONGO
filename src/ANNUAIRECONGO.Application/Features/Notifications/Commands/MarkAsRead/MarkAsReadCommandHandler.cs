using ANNUAIRECONGO.Application.Common.Interfaces;
using MediatR;
using ANNUAIRECONGO.Domain.Common.Results;
using AnnuaireCongo.Domain.Notifications;
using Microsoft.EntityFrameworkCore;

namespace ANNUAIRECONGO.Application.Features.Notifications.Commands.MarkAsRead;

public sealed class MarkAsReadCommandHandler(
    IAppDbContext context) : IRequestHandler<MarkAsReadCommand, Result<Success>>
{
    public async Task<Result<Success>> Handle(MarkAsReadCommand request, CancellationToken cancellationToken)
    {
        var notification = await context.Notifications
            .FirstOrDefaultAsync(n => n.Id == request.NotificationId && n.UserId == request.UserId, cancellationToken);

        if (notification is null)
            return NotificationErrors.NotFound(request.NotificationId);

        notification.MarkAsRead();

        await context.SaveChangesAsync(cancellationToken);
        return Result.Success;
    }
}