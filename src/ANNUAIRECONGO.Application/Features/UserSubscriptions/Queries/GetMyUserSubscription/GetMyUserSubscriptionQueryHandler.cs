using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Features.UserSubscriptions.Dtos;
using ANNUAIRECONGO.Application.Features.UserSubscriptions.Mappers;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Subscriptions.Enums;
using ANNUAIRECONGO.Domain.UserProfiles;
using ANNUAIRECONGO.Domain.UserSubscriptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ANNUAIRECONGO.Application.Features.UserSubscriptions.Queries.GetMyUserSubscription;

public sealed class GetMyUserSubscriptionQueryHandler(
    IAppDbContext context,
    IUser currentUser)
    : IRequestHandler<GetMyUserSubscriptionQuery, Result<UserSubscriptionDto>>
{
    public async Task<Result<UserSubscriptionDto>> Handle(
        GetMyUserSubscriptionQuery request,
        CancellationToken ct)
    {
        if (!Guid.TryParse(currentUser.Id, out var userGuid))
            return UserSubscriptionErrors.NotFound(Guid.Empty);

        // Return the active/expiring-soon subscription first; fall back to the most recent
        var subscription = await context.UserSubscriptions
            .Include(s => s.Plan)
            .Where(s => s.UserId == userGuid)
            .OrderByDescending(s =>
                s.Status == SubscriptionStatus.Active ? 3 :
                s.Status == SubscriptionStatus.ExpiringSoon ? 2 :
                s.Status == SubscriptionStatus.Pending ? 1 : 0)
            .ThenByDescending(s => s.StartedAt)
            .FirstOrDefaultAsync(ct);

        if (subscription is null)
            return UserSubscriptionErrors.NotFound(userGuid);

        return subscription.ToDto();
    }
}
