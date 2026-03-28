using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Features.Subscriptions.Dtos;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Subscriptions;
using ANNUAIRECONGO.Domain.Subscriptions.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ANNUAIRECONGO.Application.Features.Subscriptions.Queries.GetCompanySubscriptions;

public sealed class GetCompanySubscriptionsQueryHandler(
    IAppDbContext context) : IRequestHandler<GetCompanySubscriptionsQuery, Result<List<SubscriptionDto>>>
{
    public async Task<Result<List<SubscriptionDto>>> Handle(GetCompanySubscriptionsQuery request, CancellationToken cancellationToken)
    {
        var subscriptions = await context.Subscriptions
            .Include(s => s.Plan)
            .Where(s => s.CompanyId == request.CompanyId)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        if (subscriptions is null || !subscriptions.Any())
            return new List<SubscriptionDto>();

        var subscriptionDtos = subscriptions.Select(s => new SubscriptionDto(
            s.Id,
            s.CompanyId,
            s.PlanId,
            s.Plan.Name.ToString(),
            s.Status,
            s.StartedAt,
            s.ExpiresAt,
            s.Status == ANNUAIRECONGO.Domain.Subscriptions.Enums.SubscriptionStatus.Active || s.Status == ANNUAIRECONGO.Domain.Subscriptions.Enums.SubscriptionStatus.ExpiringSoon)).ToList();

        return subscriptionDtos;
    }
}