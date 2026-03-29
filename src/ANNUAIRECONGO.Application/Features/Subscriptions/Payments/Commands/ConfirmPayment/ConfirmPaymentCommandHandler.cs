using ANNUAIRECONGO.Application.Features.Subscriptions.Payments.Dtos;
using ANNUAIRECONGO.Application.Common.Interfaces;
using MediatR;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Subscriptions.Payments;
using Microsoft.EntityFrameworkCore;
using ANNUAIRECONGO.Application.Features.Subscriptions.Payments.Mappers;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Caching.Hybrid;
using ANNUAIRECONGO.Domain.Subscriptions.Payments.Events;

namespace ANNUAIRECONGO.Application.Features.Subscriptions.Payments.Commands.ConfirmPayment;

public sealed class ConfirmPaymentCommandHandler(
    IAppDbContext context, ILogger<ConfirmPaymentCommandHandler> logger,
    HybridCache cache) : IRequestHandler<ConfirmPaymentCommand, Result<PaymentDto>>
{
    private readonly IAppDbContext _context = context;
    private readonly ILogger<ConfirmPaymentCommandHandler> _logger = logger;
    private readonly HybridCache _cache = cache;
    public async Task<Result<PaymentDto>> Handle(ConfirmPaymentCommand request, CancellationToken cancellationToken)
    {
        var payment = await _context.Payments
            .Include(p => p.Subscription)
            .ThenInclude(s => s.Company)
            .FirstOrDefaultAsync(p => p.Id == request.PaymentId, cancellationToken);

        if (payment is null)
        {
            _logger.LogWarning("Payment with ID {PaymentId} not found", request.PaymentId);
            return PaymentErrors.PaymentNotFound(request.PaymentId);
        }

        var confirmResult = payment.MarkAsSucceeded();
        if (confirmResult.IsError)
            return confirmResult.Errors;

        _logger.LogInformation("Payment with ID {PaymentId} marked as succeeded", request.PaymentId);
        payment.AddDomainEvent(new PaymentSucceededEvent(payment.Id, payment.CompanyId,payment.SubscriptionId,payment.Subscription.Company.OwnerId.ToString(), payment.Amount, payment.Currency));
        await _context.SaveChangesAsync(cancellationToken);
        await _cache.RemoveByTagAsync("payments", cancellationToken);
        return payment.ToDto();
    }
}