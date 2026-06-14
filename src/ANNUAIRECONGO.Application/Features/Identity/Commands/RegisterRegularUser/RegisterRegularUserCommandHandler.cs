using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Identity;
using ANNUAIRECONGO.Domain.Subscriptions.Plans.Enums;
using ANNUAIRECONGO.Domain.UserSubscriptions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Identity.Commands.RegisterRegularUser;

public sealed class RegisterRegularUserCommandHandler(
    IIdentityService identityService,
    IAppDbContext context,
    ILogger<RegisterRegularUserCommandHandler> logger)
    : IRequestHandler<RegisterRegularUserCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(
        RegisterRegularUserCommand request,
        CancellationToken cancellationToken)
    {
        // 1. Create Identity user + UserProfile (assigns RegularUser role).
        //    IdentityService stages the UserProfile in the context but does NOT
        //    call SaveChangesAsync — we commit everything atomically below.
        var registerResult = await identityService.RegisterRegularUserAsync(
            request.Email,
            request.Password,
            request.FirstName,
            request.LastName,
            request.PhoneNumber,
            cancellationToken);

        if (registerResult.IsError)
            return registerResult.Errors;

        var userId = registerResult.Value;

        // 2. Auto-subscribe to Free plan so the user has a valid UserSubscription
        //    from day 1 and no empty-state edge-cases in the UI.
        var freePlan = await context.Plans
            .FirstOrDefaultAsync(p => p.Name == PlanName.Free && p.IsActive, cancellationToken);

        if (freePlan is not null)
        {
            var subResult = UserSubscription.Create(
                Guid.NewGuid(), userId, freePlan.Id, freePlan.DurationDays);

            if (!subResult.IsError)
            {
                var subscription = subResult.Value;
                subscription.Activate(); // Free plan — activate immediately
                context.UserSubscriptions.Add(subscription);
            }
            else
            {
                logger.LogWarning(
                    "Could not create free UserSubscription for user {UserId}: {Errors}",
                    userId, subResult.Errors);
            }
        }
        else
        {
            logger.LogWarning(
                "Free plan not found or inactive during RegularUser registration for user {UserId}. " +
                "Ensure the Free plan is seeded and active.", userId);
        }

        // 3. Single atomic save — commits UserProfile + UserSubscription together.
        //    If this fails, clean up the Identity user so the e-mail is not orphaned
        //    and the user can retry registration with the same address.
        try
        {
            await context.SaveChangesAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogError(ex,
                "Failed to persist UserProfile/UserSubscription for user {UserId}. Rolling back Identity user.",
                userId);

            try { await identityService.DeleteAccountAsync(userId.ToString(), cancellationToken); }
            catch (Exception cleanupEx)
            {
                logger.LogError(cleanupEx,
                    "Identity rollback also failed for user {UserId}. Manual cleanup required.", userId);
            }

            return IdentityErrors.UserCreationFailed;
        }

        // 4. Send verification email — AFTER the commit so we never email for a
        //    partially-created user. Non-fatal: the user is fully registered and
        //    can request a resend via /identity/resend-verification-email.
        try
        {
            await identityService.ResendVerificationEmailAsync(request.Email, cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex,
                "Verification email could not be sent for user {UserId}. " +
                "Registration succeeded; user can request a resend.", userId);
        }

        return userId;
    }
}
