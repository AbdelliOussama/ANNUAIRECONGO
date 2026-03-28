using ANNUAIRECONGO.Application.Features.Subscriptions.Dtos;
using ANNUAIRECONGO.Application.Common.Interfaces;
using MediatR;
using ANNUAIRECONGO.Domain.Common.Results;

namespace ANNUAIRECONGO.Application.Features.Subscriptions.Commands.ActivateSubscription;

public sealed record ActivateSubscriptionCommand(Guid SubscriptionId, string OwnerId) : IRequest<Result<SubscriptionDto>>;