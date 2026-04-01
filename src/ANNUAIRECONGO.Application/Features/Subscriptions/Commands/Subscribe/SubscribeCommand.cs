using ANNUAIRECONGO.Application.Features.Subscriptions.Dtos;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Subscriptions.Payments.Enums;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.Subscriptions.Commands.Subscribe;

public sealed record SubscribeCommand(
    Guid CompanyId,
    Guid PlanId,
    PaymentMethod Method
) : IRequest<Result<SubscriptionWithPaymentDto>>;

