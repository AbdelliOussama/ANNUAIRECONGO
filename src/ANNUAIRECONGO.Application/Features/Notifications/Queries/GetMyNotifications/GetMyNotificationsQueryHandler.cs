using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Features.Notifications.Dtos;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Notifications;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ANNUAIRECONGO.Application.Features.Notifications.Queries.GetMyNotifications;

public sealed class GetMyNotificationsQueryHandler(
    IAppDbContext context) : IRequestHandler<GetMyNotificationsQuery, Result<List<NotificationDto>>>
{
    public async Task<Result<List<NotificationDto>>> Handle(GetMyNotificationsQuery request, CancellationToken cancellationToken)
    {
        var notifications = await context.Notifications
            .Where(n => n.UserId == request.UserId)
            .AsNoTracking()
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync(cancellationToken);

        if (notifications is null || !notifications.Any())
            return new List<NotificationDto>();

        var notificationDtos = notifications.Select(n => new NotificationDto(
            n.Id,
            n.UserId,
            n.Type,
            n.Tone,
            n.Message,
            n.Link,
            n.IsRead,
            n.CreatedAt)).ToList();

        return notificationDtos;
    }
}
