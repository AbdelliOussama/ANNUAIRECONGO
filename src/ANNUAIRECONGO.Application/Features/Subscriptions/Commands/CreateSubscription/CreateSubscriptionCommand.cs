using ANNUAIRECONGO.Application.Features.Subscriptions.Dtos;
using ANNUAIRECONGO.Application.Common.Interfaces;
using MediatR;
using ANNUAIRECONGO.Domain.Common.Results;

namespace ANNUAIRECONGO.Application.Features.Subscriptions.Commands.CreateSubscription;

public sealed record CreateSubscriptionCommand(Guid CompanyId, Guid PlanId) : IRequest<Result<SubscriptionDto>>;