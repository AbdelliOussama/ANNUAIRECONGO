using AnnuaireCongo.Tests.Common.Subscriptions;
using AnnuaireCongo.Tests.Common.Subscriptions.PLans;
using ANNUAIRECONGO.Application.Features.Subscriptions.Mappers;
using Xunit;
using ANNUAIRECONGO.Domain.Subscriptions;
using System.Reflection;

namespace AnnuaireCongo.Application.UnitTests.Mappers;

public class SubscriptionMapperTests
{
    [Fact]
    public void Subscription_ToDto_ShouldMapPropertiesCorrectly()
    {
        // Arrange
        var subscription = SubscriptionFactory.CreateSubscription().Value;
        var plan = PlanFactory.CreatePlan().Value;
        
        // Use reflection to set the navigation property for testing since it's an EF navigation property
        var planProp = typeof(Subscription).GetProperty("Plan");
        planProp?.SetValue(subscription, plan);

        // Act
        var dto = subscription.ToDto();

        // Assert
        Assert.NotNull(dto);
        Assert.Equal(subscription.Id, dto.Id);
        Assert.Equal(subscription.CompanyId, dto.CompanyId);
        Assert.Equal(subscription.PlanId, dto.PlanId);
        Assert.Equal(plan.Name.ToString(), dto.PlanName);
        Assert.Equal(subscription.Status, dto.Status);
        Assert.Equal(subscription.StartedAt, dto.StartedAt);
        Assert.Equal(subscription.ExpiresAt, dto.ExpiresAt);
        Assert.False(dto.IsActive); // Pending status is not active
    }

    [Fact]
    public void SubscriptionList_ToDtoList_ShouldMapAllItems()
    {
        // Arrange
        var sub = SubscriptionFactory.CreateSubscription().Value;
        var plan = PlanFactory.CreatePlan().Value;
        typeof(Subscription).GetProperty("Plan")?.SetValue(sub, plan);
        
        var subscriptions = new[] { sub };

        // Act
        var dtos = subscriptions.ToDtoList();

        // Assert
        Assert.NotNull(dtos);
        Assert.Single(dtos);
    }
}
