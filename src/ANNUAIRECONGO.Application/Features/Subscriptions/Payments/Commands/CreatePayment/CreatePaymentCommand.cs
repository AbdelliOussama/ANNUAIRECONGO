using ANNUAIRECONGO.Application.Features.Subscriptions.Payments.Dtos;
using ANNUAIRECONGO.Application.Common.Interfaces;
using MediatR;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Subscriptions.Payments.Enums;

namespace ANNUAIRECONGO.Application.Features.Subscriptions.Payments.Commands.CreatePayment;

public sealed record CreatePaymentCommand(
    Guid CompanyId,
    Guid SubscriptionId,
    decimal Amount,
    string Currency,
    PaymentMethod Method,
    string? GatewayRef,
    string? InvoiceUrl,
    DateTime? PaidAt)
: IRequest<Result<PaymentDto>>;