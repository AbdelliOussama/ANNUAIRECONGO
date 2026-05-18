using AnnuaireCongo.Tests.Common.Geography;
using ANNUAIRECONGO.Application.Features.Geography.Mappers;
using Xunit;

namespace AnnuaireCongo.Application.UnitTests.Mappers;

public class GeographyMapperTests
{
    [Fact]
    public void City_ToDto_ShouldMapPropertiesCorrectly()
    {
        // Arrange
        var city = CityFactory.CreateCity().Value;

        // Act
        var dto = city.ToDto();

        // Assert
        Assert.NotNull(dto);
        Assert.Equal(city.Id, dto.Id);
        Assert.Equal(city.Name, dto.Name);
        Assert.Equal(city.RegionId, dto.RegionId);
    }

    [Fact]
    public void CityList_ToDtoList_ShouldMapAllItems()
    {
        // Arrange
        var cities = new[] { CityFactory.CreateCity().Value, CityFactory.CreateCity().Value };

        // Act
        var dtos = cities.ToDtoList();

        // Assert
        Assert.NotNull(dtos);
        Assert.Equal(2, dtos.Count);
    }

    [Fact]
    public void Region_ToDto_ShouldMapPropertiesCorrectly()
    {
        // Arrange
        var region = RegionFactory.CreateRegion().Value;

        // Act
        var dto = region.ToDto();

        // Assert
        Assert.NotNull(dto);
        Assert.Equal(region.Id, dto.Id);
        Assert.Equal(region.Name, dto.Name);
        Assert.NotNull(dto.Cities);
    }

    [Fact]
    public void RegionList_ToDtoList_ShouldMapAllItems()
    {
        // Arrange
        var regions = new[] { RegionFactory.CreateRegion().Value };

        // Act
        var dtos = regions.ToDtoList();

        // Assert
        Assert.NotNull(dtos);
        Assert.Single(dtos);
    }
}
