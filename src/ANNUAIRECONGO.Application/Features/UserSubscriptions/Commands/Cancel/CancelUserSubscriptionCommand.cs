using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.UserSubscriptions.Commands.Cancel;

public sealed record CancelUserSubscriptionCommand(Guid SubscriptionId)
    : IRequest<Result<Success>>;
