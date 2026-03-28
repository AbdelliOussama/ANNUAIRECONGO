using ANNUAIRECONGO.Application.Common.Interfaces;
using MediatR;
using ANNUAIRECONGO.Domain.Common.Results;

namespace ANNUAIRECONGO.Application.Features.Notifications.Commands.DeleteNotification;

public sealed record DeleteNotificationCommand(Guid NotificationId, string UserId) : IRequest<Result<Success>>;