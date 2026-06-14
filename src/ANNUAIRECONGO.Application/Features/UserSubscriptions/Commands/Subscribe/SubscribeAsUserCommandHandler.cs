using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Features.UserSubscriptions.Dtos;
using ANNUAIRECONGO.Application.Features.UserSubscriptions.Mappers;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Subscriptions.Enums;
using ANNUAIRECONGO.Domain.Subscriptions.Plans;
using ANNUAIRECONGO.Domain.UserProfiles;
using ANNUAIRECONGO.Domain.UserSubscriptions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.UserSubscriptions.Commands.Subscribe;

public sealed class SubscribeAsUserCommandHandler(
    IAppDbContext context,
    IUser currentUser,
    ILogger<SubscribeAsUserCommandHandler> logger)
    : IRequestHandler<SubscribeAsUserCommand, Result<UserSubscriptionDto>>
{
    public async Task<Result<UserSubscriptionDto>> Handle(
        SubscribeAsUserCommand request,
        CancellationToken ct)
    {
        if (!Guid.TryParse(currentUser.Id, out var userGuid))
            return UserProfileErrors.NotFound(Guid.Empty);

        // 1. Verify the user has a UserProfile (i.e. is a RegularUser)
        var profile = await context.UserProfiles
            .FirstOrDefaultAsync(p => p.Id == userGuid, ct);

        if (profile is null)
            return UserProfileErrors.NotFound(userGuid);

        // 2. Validate plan
        var plan = await context.Plans
            .FirstOrDefaultAsync(p => p.Id == request.PlanId && p.IsActive, ct);

        if (plan is null)
            return PlanErrors.NotFound(request.PlanId);

        // 3. Cancel any non-terminal UserSubscription (upgrade / plan-change).
        //    Pending is included: a user awaiting admin payment confirmation cannot
        //    accumulate multiple pending subscriptions that all get activated later.
        var existingActive = await context.UserSubscriptions
            .FirstOrDefaultAsync(s =>
                s.UserId == userGuid &&
                (s.Status == SubscriptionStatus.Active ||
                 s.Status == SubscriptionStatus.ExpiringSoon ||
                 s.Status == SubscriptionStatus.Pending), ct);

        if (existingActive is not null)
        {
            var cancelResult = existingActive.Cancel();
            if (cancelResult.IsError)
            {
                logger.LogWarning(
                    "Could not cancel existing UserSubscription {SubId} for upgrade: {Error}",
                    existingActive.Id, cancelResult.Errors.First().Description);
                return cancelResult.Errors;
            }
            logger.LogInformation(
                "UserSubscription {SubId} cancelled for plan upgrade (user {UserId})",
                existingActive.Id, userGuid);
        }

        // 4. Create new UserSubscription (Pending)
        var subResult = UserSubscription.Create(
            Guid.NewGuid(), userGuid, plan.Id, plan.DurationDays);

        if (subResult.IsError)
            return subResult.Errors;

        var subscription = subResult.Value;

        // 5. Free plan — activate immediately
        if (plan.Price == 0)
            subscription.Activate();

        context.UserSubscriptions.Add(subscription);
        await context.SaveChangesAsync(ct);

        // Reload with Plan navigation so the Dto mapper has a Plan reference
        await context.UserSubscriptions
            .Entry(subscription)
            .Reference(s => s.Plan)
            .LoadAsync(ct);

        return subscription.ToDto();
    }
}
