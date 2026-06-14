using ANNUAIRECONGO.Application.Features.Subscriptions.Dtos;
using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.Subscriptions.Queries.GetCompanySubscriptions;

// NOTE: Previously implemented ICachedQuery<Result<List<SubscriptionDto>>> but HybridCache
// cannot serialize the Result<T> discriminated union → unhandled exception → HTTP 500.
// Subscription data changes on every payment so caching is not needed here.
public sealed record GetCompanySubscriptionsQuery(Guid CompanyId, string? UserId)
    : IRequest<Result<List<SubscriptionDto>>>;
