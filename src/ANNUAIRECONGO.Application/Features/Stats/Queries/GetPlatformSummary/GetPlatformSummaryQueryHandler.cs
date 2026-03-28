using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Features.Stats.Dtos;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Companies;
using ANNUAIRECONGO.Domain.Companies.Enums;
using ANNUAIRECONGO.Domain.Subscriptions;
using ANNUAIRECONGO.Domain.Subscriptions.Enums;
using ANNUAIRECONGO.Domain.Subscriptions.Payments;
using ANNUAIRECONGO.Domain.Subscriptions.Payments.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ANNUAIRECONGO.Application.Features.Stats.Queries.GetPlatformSummary;

public sealed class GetPlatformSummaryQueryHandler(
    IAppDbContext context) : IRequestHandler<GetPlatformSummaryQuery, Result<PlatformSummaryDto>>
{
    public async Task<Result<PlatformSummaryDto>> Handle(GetPlatformSummaryQuery request, CancellationToken cancellationToken)
    {
        var totalCompanies = await context.Companies.CountAsync(cancellationToken);
        var activeCompanies = await context.Companies
            .CountAsync(c => c.Status == CompanyStatus.Active, cancellationToken);
        var totalSubscriptions = await context.Subscriptions.CountAsync(cancellationToken);
        var activeSubscriptions = await context.Subscriptions
            .CountAsync(s => s.Status == SubscriptionStatus.Active || s.Status == SubscriptionStatus.ExpiringSoon, cancellationToken);
        var totalRevenue = await context.Payments
            .Where(p => p.Status == PaymentStatus.Success)
            .SumAsync(p => (decimal?)p.Amount, cancellationToken) ?? 0;

        var dto = new PlatformSummaryDto(
            totalCompanies,
            activeCompanies,
            totalSubscriptions,
            activeSubscriptions,
            totalRevenue);

        return dto;
    }
}