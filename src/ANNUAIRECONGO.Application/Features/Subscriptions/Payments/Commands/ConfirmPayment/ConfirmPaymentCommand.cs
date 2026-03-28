using ANNUAIRECONGO.Application.Features.Subscriptions.Payments.Dtos;
using ANNUAIRECONGO.Application.Common.Interfaces;
using MediatR;
using ANNUAIRECONGO.Domain.Common.Results;

namespace ANNUAIRECONGO.Application.Features.Subscriptions.Payments.Commands.ConfirmPayment;

public sealed record ConfirmPaymentCommand(Guid PaymentId, string OwnerId, string GatewayRef) : IRequest<Result<PaymentDto>>;