using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Features.Companies.Commands.StatusTransition.RejectCompany;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Subscriptions.Payments;
using ANNUAIRECONGO.Domain.Subscriptions.Payments.Enums;
using ANNUAIRECONGO.Domain.Subscriptions.Payments.Events;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Hybrid;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Subscriptions.Payments.Commands.RejectPayment;

public sealed record RejectPaymentCommandHandler(IAppDbContext context, ILogger<RejectPaymentCommandHandler> logger, HybridCache cache) : IRequestHandler<RejectPaymentCommand, Result<Updated>>
{
    private readonly IAppDbContext _context =context;
    private readonly ILogger<RejectPaymentCommandHandler> _logger = logger;
    private readonly HybridCache _cache = cache;
    public async Task<Result<Updated>> Handle(RejectPaymentCommand request, CancellationToken cancellationToken)
    {
        var payment =await  _context.Payments.Include(p => p.Company).ThenInclude(c =>c.Owner).FirstOrDefaultAsync(p => p.Id == request.PaymentId);

        if (payment is null)
        {
            _logger.LogWarning("Payment with id {PaymentId} not found", request.PaymentId);
            return PaymentErrors.PaymentNotFound(request.PaymentId);
        }
        var rejectionResult = payment.MarkAsFailed();
        if(rejectionResult.IsError)
        {
            _logger.LogWarning("Failed to reject payment with id {PaymentId}: {ErrorMessage}", request.PaymentId, rejectionResult.Errors.First().Description);
            return rejectionResult.Errors.First();
        }
        payment.AddDomainEvent(new PaymentFailedEvent(payment.Id, payment.CompanyId, payment.Company.OwnerId.ToString(),request.reason));
        await _context.SaveChangesAsync(cancellationToken);
        await _cache.RemoveByTagAsync("payment", cancellationToken);
        _logger.LogInformation("Payment with id {PaymentId} rejected successfully", request.PaymentId);
        return Result.Updated;
    }
}