using ANNUAIRECONGO.Application.Features.UserSubscriptions.Dtos;
using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.UserSubscriptions.Queries.GetMyUserSubscription;

/// <summary>Returns the active (or most recent) UserSubscription of the currently authenticated RegularUser.</summary>
public sealed record GetMyUserSubscriptionQuery : IRequest<Result<UserSubscriptionDto>>;
