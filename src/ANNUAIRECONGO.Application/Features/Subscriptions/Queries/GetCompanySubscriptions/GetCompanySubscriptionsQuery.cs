using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Features.Subscriptions.Dtos;
using ANNUAIRECONGO.Domain.Common.Results;

namespace ANNUAIRECONGO.Application.Features.Subscriptions.Queries.GetCompanySubscriptions;

public sealed record GetCompanySubscriptionsQuery(Guid CompanyId, string? UserId) : ICachedQuery<Result<List<SubscriptionDto>>>
{
    public string CacheKey => $"company-subscriptions-{CompanyId}-{UserId}";
    
    public string[] Tags => ["company", "subscriptions"];
    
    public TimeSpan Expiration => TimeSpan.FromMinutes(10);
}
