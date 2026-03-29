using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Features.Companies.Commands.StatusTransition.RejectCompany;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Subscriptions.Payments;
using ANNUAIRECONGO.Domain.Subscriptions.Payments.Events;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Hybrid;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Subscriptions.Payments.Commands.RejectPayment;

public sealed record RejectPaymentCommandHandler(IAppDbContext context, ILogger<RejectPaymentComamndHandler> logger, HybridCache cache) : IRequestHandler<RejectCompanyCommand, Result<Updated>>
{
    private readonly IAppDbContext _context =context;
    private readonly ILogger<RejectPaymentComamndHandler> _logger = logger;
    private readonly HybridCache _cache = cache;
    public async Task<Result<Updated>> Handle(RejectCompanyCommand request, CancellationToken cancellationToken)
    {
        var payment = _context.Payments.Include(p => p.Company).ThenInclude(c =>c.Owner).FirstOrDefault(p => p.Id == request.companyId);

        if (payment is null)
        {
            _logger.LogWarning("Payment with id {PaymentId} not found", request.companyId);
            return PaymentErrors.PaymentNotFound(request.companyId);
        }
        var rejectionResult = payment.MarkAsFailed();
        if(rejectionResult.IsError)
        {
            _logger.LogWarning("Failed to reject payment with id {PaymentId}: {ErrorMessage}", request.companyId, rejectionResult.Errors.First().Description);
            return rejectionResult.Errors.First();
        }
        payment.AddDomainEvent(new PaymentFailedEvent(payment.Id, payment.CompanyId, payment.Company.OwnerId.ToString(),request.reason));
        await _context.SaveChangesAsync(cancellationToken);
        await _cache.RemoveByTagAsync("payment", cancellationToken);
        _logger.LogInformation("Payment with id {PaymentId} rejected successfully", request.companyId);
        return Result.Updated;
    }
}