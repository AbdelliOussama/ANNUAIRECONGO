using ANNUAIRECONGO.Application.Features.Subscriptions.Dtos;
using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.Subscriptions.Queries.GetMyActiveSubscription;

public sealed record GetMyActiveSubscriptionQuery(Guid CompanyId) : IRequest<Result<SubscriptionDto>>;
