using ANNUAIRECONGO.Application.Features.Subscriptions.Payments.Dtos;
using ANNUAIRECONGO.Application.Common.Interfaces;
using MediatR;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Subscriptions;

using Microsoft.EntityFrameworkCore;
using ANNUAIRECONGO.Domain.Subscriptions.Payments;
namespace ANNUAIRECONGO.Application.Features.Subscriptions.Payments.Commands.CreatePayment;

public sealed class CreatePaymentCommandHandler(
    IAppDbContext context) : IRequestHandler<CreatePaymentCommand, Result<PaymentDto>>
{
    private readonly IAppDbContext _context = context;

    public async Task<Result<PaymentDto>> Handle(CreatePaymentCommand request, CancellationToken cancellationToken)
    {
        var subscription = await _context.Subscriptions
            .Include(s => s.Company)
            .FirstOrDefaultAsync(s => s.Id == request.SubscriptionId, cancellationToken);

        if (subscription is null)
            return SubscriptionErrors.NotFound(request.SubscriptionId);

        if (subscription.CompanyId != request.CompanyId)
            return SubscriptionErrors.NotFound(request.SubscriptionId);

        var paymentResult = Payment.Create(
            Guid.NewGuid(),
            request.CompanyId,
            request.SubscriptionId,
            request.Amount,
            request.Currency,
            request.Method,
            request.GatewayRef,
            request.InvoiceUrl,
            request.PaidAt
        );

        if (paymentResult.IsError)
            return paymentResult.Errors;

        var payment = paymentResult.Value;

        await _context.Payments.AddAsync(payment, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

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