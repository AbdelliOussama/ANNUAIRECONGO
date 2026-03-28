using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Features.Subscriptions.Payments.Dtos;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Subscriptions.Payments;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ANNUAIRECONGO.Application.Features.Subscriptions.Payments.Queries.GetCompanyPayments;

public sealed class GetCompanyPaymentsQueryHandler(
    IAppDbContext context) : IRequestHandler<GetCompanyPaymentsQuery, Result<List<PaymentDto>>>
{
    public async Task<Result<List<PaymentDto>>> Handle(GetCompanyPaymentsQuery request, CancellationToken cancellationToken)
    {
        var payments = await context.Payments
            .Include(p => p.Subscription)
                .ThenInclude(s => s.Company)
            .Where(p => p.CompanyId == request.CompanyId)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        if (payments is null || !payments.Any())
            return new List<PaymentDto>();

        var paymentDtos = payments.Select(p => new PaymentDto(
            p.Id,
            p.CompanyId,
            p.SubscriptionId,
            p.Amount,
            p.Currency,
            p.Method,
            p.Status,
            p.GatewayRef,
            p.InvoiceUrl,
            p.PaidAt)).ToList();

        return paymentDtos;
    }
}