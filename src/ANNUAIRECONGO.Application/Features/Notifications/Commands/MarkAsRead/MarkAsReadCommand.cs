using ANNUAIRECONGO.Application.Common.Interfaces;
using MediatR;
using ANNUAIRECONGO.Domain.Common.Results;

namespace ANNUAIRECONGO.Application.Features.Notifications.Commands.MarkAsRead;

public sealed record MarkAsReadCommand(Guid NotificationId, string UserId) : IRequest<Result<Success>>;