using ANNUAIRECONGO.Application.Features.Subscriptions.Payments.Dtos;
using ANNUAIRECONGO.Application.Common.Interfaces;
using MediatR;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Subscriptions.Payments;
using ANNUAIRECONGO.Domain.Subscriptions;
using Microsoft.EntityFrameworkCore;

namespace ANNUAIRECONGO.Application.Features.Subscriptions.Payments.Commands.ConfirmPayment;

public sealed class ConfirmPaymentCommandHandler(
    IAppDbContext context) : IRequestHandler<ConfirmPaymentCommand, Result<PaymentDto>>
{
    public async Task<Result<PaymentDto>> Handle(ConfirmPaymentCommand request, CancellationToken cancellationToken)
    {
        var payment = await context.Payments
            .Include(p => p.Subscription)
                .ThenInclude(s => s.Company)
            .FirstOrDefaultAsync(p => p.Id == request.PaymentId, cancellationToken);

        if (payment is null)
            return PaymentErrors.PaymentNotFound(request.PaymentId);

        var confirmResult = payment.MarkAsSucceeded();
        if (confirmResult.IsError)
            return confirmResult.Errors;

        await context.SaveChangesAsync(cancellationToken);

        var paymentDto = new PaymentDto(
            payment.Id,
            payment.CompanyId,
            payment.SubscriptionId,
            payment.Amount,
            payment.Currency,
            payment.Method,
            payment.Status,
            payment.GatewayRef,
            payment.InvoiceUrl,
            payment.PaidAt);

        return paymentDto;
    }
}