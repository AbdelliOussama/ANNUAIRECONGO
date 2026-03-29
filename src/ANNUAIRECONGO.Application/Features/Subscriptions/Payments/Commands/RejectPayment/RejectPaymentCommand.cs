using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.Subscriptions.Payments.Commands.RejectPayment;

public sealed record RejectPaymentComamndHandler(Guid PaymentId,string reason) : IRequest<Result<Updated>>;