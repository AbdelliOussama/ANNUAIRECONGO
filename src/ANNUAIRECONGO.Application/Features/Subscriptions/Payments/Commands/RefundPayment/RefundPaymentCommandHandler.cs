using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Subscriptions.Payments;
using ANNUAIRECONGO.Domain.Subscriptions.Payments.Events;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Hybrid;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Subscriptions.Payments.Commands.RefundPayment;

public sealed record RefundPaymentCommandHandler(IAppDbContext context, ILogger<RefundPaymentCommandHandler> logger, HybridCache cache) : IRequestHandler<RefundPaymentCommand, Result<Updated>>
{
    private readonly IAppDbContext _context = context;
    private readonly ILogger<RefundPaymentCommandHandler> _logger = logger;
    private readonly HybridCache _cache = cache;
    public async Task<Result<Updated>> Handle(RefundPaymentCommand request, CancellationToken cancellationToken)
    {
        var payment = _context.Payments.Include(p =>p.Company).ThenInclude(p => p.Owner).FirstOrDefault(p => p.Id == request.PaymentId);
        if (payment is null)
        {
            _logger.LogWarning("Payment with ID {PaymentId} not found for refund", request.PaymentId);
            return PaymentErrors.PaymentNotFound(request.PaymentId);
        }

        var result = payment.Refund();
        if (result.IsError)
        {
            _logger.LogWarning("Failed to refund payment with ID {PaymentId}: {Error}", request.PaymentId, result.Errors);
            return result.Errors;
        }

        await _context.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Payment with ID {PaymentId} refunded successfully", request.PaymentId);
        payment.AddDomainEvent(new PaymentRefundedEvent(payment.Id, payment.CompanyId, payment.Company.OwnerId.ToString(), payment.Amount));
        await _cache.RemoveByTagAsync("payments", cancellationToken);
        return Result.Updated;
    }
}