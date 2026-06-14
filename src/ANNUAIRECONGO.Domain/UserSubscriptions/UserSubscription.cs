using ANNUAIRECONGO.Domain.Common;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Subscriptions.Enums;
using ANNUAIRECONGO.Domain.Subscriptions.Plans;
using ANNUAIRECONGO.Domain.UserProfiles;

namespace ANNUAIRECONGO.Domain.UserSubscriptions;

/// <summary>
/// A plan subscription that belongs directly to a <see cref="UserProfile"/> (regular user),
/// as opposed to <see cref="Subscriptions.Subscription"/> which belongs to a Company.
/// </summary>
public sealed class UserSubscription : AuditableEntity
{
    public Guid             UserId    { get; private set; }
    public Guid             PlanId    { get; private set; }
    public SubscriptionStatus Status  { get; private set; }
    public DateTimeOffset   StartedAt { get; private set; }
    public DateTimeOffset   ExpiresAt { get; private set; }

    // Navigation properties
    public UserProfile UserProfile { get; private set; } = null!;
    public Plan        Plan        { get; private set; } = null!;

    private UserSubscription() { }

    private UserSubscription(Guid id, Guid userId, Guid planId, int durationDays)
        : base(id)
    {
        UserId    = userId;
        PlanId    = planId;
        Status    = SubscriptionStatus.Pending;
        StartedAt = DateTimeOffset.UtcNow;
        ExpiresAt = StartedAt.AddDays(durationDays);
    }

    // ── Factory ───────────────────────────────────────────────────

    public static Result<UserSubscription> Create(
        Guid id,
        Guid userId,
        Guid planId,
        int  durationDays)
    {
        if (durationDays <= 0)
            return UserSubscriptionErrors.InvalidDuration;
        if (planId == Guid.Empty)
            return UserSubscriptionErrors.PlanIdRequired;
        if (userId == Guid.Empty)
            return UserSubscriptionErrors.UserIdRequired;

        return new UserSubscription(id, userId, planId, durationDays);
    }

    // ── State transitions ─────────────────────────────────────────

    public Result<Updated> Activate()
    {
        if (Status != SubscriptionStatus.Pending)
            return UserSubscriptionErrors.NotPending;

        Status = SubscriptionStatus.Active;
        return Result.Updated;
    }

    public Result<Updated> MarkAsExpiringSoon()
    {
        if (Status != SubscriptionStatus.Active)
            return UserSubscriptionErrors.NotActive;

        Status = SubscriptionStatus.ExpiringSoon;
        return Result.Updated;
    }

    public Result<Updated> MarkAsExpired()
    {
        if (Status is not (SubscriptionStatus.Active or SubscriptionStatus.ExpiringSoon))
            return UserSubscriptionErrors.NotActive;

        Status = SubscriptionStatus.Expired;
        return Result.Updated;
    }

    public Result<Updated> Cancel()
    {
        if (Status is not (SubscriptionStatus.Active or SubscriptionStatus.ExpiringSoon or SubscriptionStatus.Pending))
            return UserSubscriptionErrors.CannotCancel;

        Status = SubscriptionStatus.Cancelled;
        return Result.Updated;
    }
}
