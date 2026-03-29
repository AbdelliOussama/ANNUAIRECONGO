using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.Subscriptions.Payments.Commands.RefundPayment;

public sealed record RefundPaymentCommand(Guid PaymentId) : IRequest<Result<Updated>>;