using ANNUAIRECONGO.Application.Common.Interfaces;
using MediatR;
using ANNUAIRECONGO.Domain.Common.Results;

namespace ANNUAIRECONGO.Application.Features.Notifications.Commands.MarkAllRead;

public sealed record MarkAllReadCommand(string UserId) : IRequest<Result<Success>>;