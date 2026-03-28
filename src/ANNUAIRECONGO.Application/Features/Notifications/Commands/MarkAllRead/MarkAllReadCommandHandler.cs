using ANNUAIRECONGO.Application.Common.Interfaces;
using MediatR;
using ANNUAIRECONGO.Domain.Common.Results;
using AnnuaireCongo.Domain.Notifications;
using Microsoft.EntityFrameworkCore;

namespace ANNUAIRECONGO.Application.Features.Notifications.Commands.MarkAllRead;

public sealed class MarkAllReadCommandHandler(
    IAppDbContext context) : IRequestHandler<MarkAllReadCommand, Result<Success>>
{
    public async Task<Result<Success>> Handle(MarkAllReadCommand request, CancellationToken cancellationToken)
    {
        var notifications = await context.Notifications
            .Where(n => n.UserId == request.UserId)
            .ToListAsync(cancellationToken);

        foreach (var notification in notifications)
        {
            notification.MarkAsRead();
        }

        await context.SaveChangesAsync(cancellationToken);
        return Result.Success;
    }
}