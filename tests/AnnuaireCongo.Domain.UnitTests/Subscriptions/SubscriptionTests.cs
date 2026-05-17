using AnnuaireCongo.Tests.Common.Subscriptions.PLans;
using AnnuaireCongo.Tests.Common.Subscriptions;
using ANNUAIRECONGO.Domain.Subscriptions.Enums;
using ANNUAIRECONGO.Domain.Subscriptions.Plans.Enums;
using ANNUAIRECONGO.Domain.Subscriptions.Plans;
using Xunit;

namespace AnnuaireCongo.Domain.UnitTests.Subscriptions;

public class PlanTests
{
    // ── Create ────────────────────────────────────────────────────────────────

    [Fact]
    public void Create_WithValidData_ShouldSucceed()
    {
        var result = PlanFactory.CreatePlan();

        Assert.False(result.IsError);
        Assert.Equal(PlanName.Free, result.Value.Name);
        Assert.Equal(9.99m, result.Value.Price);
        Assert.Equal(30, result.Value.DurationDays);
        Assert.True(result.Value.IsActive);
    }



    [Fact]
    public void Create_WithNegativePrice_ShouldReturnError()
    {
        var result = PlanFactory.CreatePlan(price: -1m);
        Assert.True(result.IsError);
    }

    [Fact]
    public void Create_WithZeroDuration_ShouldReturnError()
    {
        var result = PlanFactory.CreatePlan(durationDays: 0);
        Assert.True(result.IsError);
    }



    // ── Activate / Deactivate ─────────────────────────────────────────────────

    [Fact]
    public void Deactivate_WhenActive_ShouldSucceed()
    {
        var plan = PlanFactory.CreatePlan().Value;
        Assert.True(plan.IsActive);

        var result = plan.Deactivate();

        Assert.False(result.IsError);
        Assert.False(plan.IsActive);
    }

    [Fact]
    public void Deactivate_WhenAlreadyInactive_ShouldReturnError()
    {
        var plan = PlanFactory.CreatePlan().Value;
        plan.Deactivate();

        var result = plan.Deactivate();

        Assert.True(result.IsError);
    }

    [Fact]
    public void Activate_WhenInactive_ShouldSucceed()
    {
        var plan = PlanFactory.CreatePlan().Value;
        plan.Deactivate();

        var result = plan.Activate();

        Assert.False(result.IsError);
        Assert.True(plan.IsActive);
    }

    [Fact]
    public void Activate_WhenAlreadyActive_ShouldReturnError()
    {
        var plan = PlanFactory.CreatePlan().Value;

        var result = plan.Activate();

        Assert.True(result.IsError);
    }
}

public class SubscriptionTests
{
    // ── Create ────────────────────────────────────────────────────────────────

    [Fact]
    public void Create_WithValidData_ShouldBeInPendingState()
    {
        var result = SubscriptionFactory.CreateSubscription();

        Assert.False(result.IsError);
        Assert.Equal(SubscriptionStatus.Pending, result.Value.Status);
        Assert.True(result.Value.ExpiresAt > result.Value.StartedAt);
    }

    [Fact]
    public void Create_WithZeroDuration_ShouldReturnError()
    {
        var result = SubscriptionFactory.CreateSubscription(durationDays: 0);
        Assert.True(result.IsError);
    }

    [Fact]
    public void Create_WithNegativeDuration_ShouldReturnError()
    {
        var result = SubscriptionFactory.CreateSubscription(durationDays: -5);
        Assert.True(result.IsError);
    }

    [Fact]
    public void Create_WithEmptyPlanId_ShouldReturnError()
    {
        var result = SubscriptionFactory.CreateSubscription(planId: Guid.Empty);
        Assert.True(result.IsError);
    }

    // ── State Transitions ─────────────────────────────────────────────────────

    [Fact]
    public void Activate_FromPending_ShouldTransitionToActive()
    {
        var subscription = SubscriptionFactory.CreateSubscription().Value;

        var result = subscription.Activate();

        Assert.False(result.IsError);
        Assert.Equal(SubscriptionStatus.Active, subscription.Status);
    }

    [Fact]
    public void Activate_WhenAlreadyActive_ShouldReturnError()
    {
        var subscription = SubscriptionFactory.CreateSubscription().Value;
        subscription.Activate();

        var result = subscription.Activate();

        Assert.True(result.IsError);
    }

    [Fact]
    public void MarkAsExpiringSoon_WhenActive_ShouldSucceed()
    {
        var subscription = SubscriptionFactory.CreateSubscription().Value;
        subscription.Activate();

        var result = subscription.MarkAsExpiringSoon();

        Assert.False(result.IsError);
        Assert.Equal(SubscriptionStatus.ExpiringSoon, subscription.Status);
    }

    [Fact]
    public void MarkAsExpiringSoon_WhenPending_ShouldReturnError()
    {
        var subscription = SubscriptionFactory.CreateSubscription().Value;

        var result = subscription.MarkAsExpiringSoon();

        Assert.True(result.IsError);
    }

    [Fact]
    public void MarkAsExpired_WhenActive_ShouldSucceed()
    {
        var subscription = SubscriptionFactory.CreateSubscription().Value;
        subscription.Activate();

        var result = subscription.MarkAsExpired();

        Assert.False(result.IsError);
        Assert.Equal(SubscriptionStatus.Expired, subscription.Status);
    }

    [Fact]
    public void MarkAsExpired_WhenExpiringSoon_ShouldSucceed()
    {
        var subscription = SubscriptionFactory.CreateSubscription().Value;
        subscription.Activate();
        subscription.MarkAsExpiringSoon();

        var result = subscription.MarkAsExpired();

        Assert.False(result.IsError);
        Assert.Equal(SubscriptionStatus.Expired, subscription.Status);
    }

    [Fact]
    public void Cancel_FromActive_ShouldTransitionToCancelled()
    {
        var subscription = SubscriptionFactory.CreateSubscription().Value;
        subscription.Activate();

        var result = subscription.Cancel();

        Assert.False(result.IsError);
        Assert.Equal(SubscriptionStatus.Cancelled, subscription.Status);
    }

    [Fact]
    public void Cancel_WhenAlreadyCancelled_ShouldReturnError()
    {
        var subscription = SubscriptionFactory.CreateSubscription().Value;
        subscription.Activate();
        subscription.Cancel();

        var result = subscription.Cancel();

        Assert.True(result.IsError);
    }

    [Fact]
    public void Cancel_WhenExpired_ShouldReturnError()
    {
        var subscription = SubscriptionFactory.CreateSubscription().Value;
        subscription.Activate();
        subscription.MarkAsExpired();

        var result = subscription.Cancel();

        Assert.True(result.IsError);
    }
}
