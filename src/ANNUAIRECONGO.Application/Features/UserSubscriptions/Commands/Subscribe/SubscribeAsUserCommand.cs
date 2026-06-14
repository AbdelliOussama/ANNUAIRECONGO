using ANNUAIRECONGO.Application.Features.UserSubscriptions.Dtos;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Subscriptions.Payments.Enums;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.UserSubscriptions.Commands.Subscribe;

/// <summary>
/// Subscribes the currently authenticated <c>RegularUser</c> to a plan.
/// For the Free plan the subscription is activated immediately.
/// For paid plans it remains Pending until an admin confirms the payment.
/// </summary>
public sealed record SubscribeAsUserCommand(
    Guid          PlanId,
    PaymentMethod Method
) : IRequest<Result<UserSubscriptionDto>>;
