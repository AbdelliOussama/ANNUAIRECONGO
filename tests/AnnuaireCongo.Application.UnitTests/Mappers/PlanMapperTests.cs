using AnnuaireCongo.Tests.Common.Subscriptions.PLans;
using ANNUAIRECONGO.Application.Features.Plans.Mappers;
using Xunit;

namespace AnnuaireCongo.Application.UnitTests.Mappers;

public class PlanMapperTests
{
    [Fact]
    public void Plan_ToDto_ShouldMapPropertiesCorrectly()
    {
        // Arrange
        var plan = PlanFactory.CreatePlan().Value;

        // Act
        var dto = plan.ToDto();

        // Assert
        Assert.NotNull(dto);
        Assert.Equal(plan.Id, dto.Id);
        Assert.Equal(plan.Name, dto.Name);
        Assert.Equal(plan.Price, dto.Price);
        Assert.Equal(plan.DurationDays, dto.DurationDays);
        Assert.Equal(plan.MaxImages, dto.MaxImages);
        Assert.Equal(plan.MaxDocuments, dto.MaxDocuments);
        Assert.Equal(plan.HasAnalytics, dto.HasAnalytics);
        Assert.Equal(plan.HasFeaturedBadge, dto.HasFeaturedBadge);
        Assert.Equal(plan.SearchPriority, dto.SearchPriority);
        Assert.Equal(plan.IsActive, dto.IsActive);
    }

    [Fact]
    public void PlanList_ToDtoList_ShouldMapAllItems()
    {
        // Arrange
        var plans = new[] { PlanFactory.CreatePlan().Value };

        // Act
        var dtos = plans.ToDtoList();

        // Assert
        Assert.NotNull(dtos);
        Assert.Single(dtos);
    }
}
