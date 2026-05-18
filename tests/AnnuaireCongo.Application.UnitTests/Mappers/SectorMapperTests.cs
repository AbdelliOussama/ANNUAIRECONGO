using AnnuaireCongo.Tests.Common.Sectors;
using ANNUAIRECONGO.Application.Features.Sectors.Mappers;
using Xunit;

namespace AnnuaireCongo.Application.UnitTests.Mappers;

public class SectorMapperTests
{
    [Fact]
    public void Sector_ToDto_ShouldMapPropertiesCorrectly()
    {
        // Arrange
        var sector = SectorFactory.CreateSector().Value;

        // Act
        var dto = sector.ToDto();

        // Assert
        Assert.NotNull(dto);
        Assert.Equal(sector.Id, dto.SectorId);
        Assert.Equal(sector.Name, dto.Name);
        Assert.Equal(sector.Slug, dto.Slug);
        Assert.Equal(sector.IconUrl, dto.IconUrl);
        Assert.Equal(sector.Description, dto.Description);
        Assert.Equal(sector.IsActive, dto.IsActive);
    }

    [Fact]
    public void SectorList_ToDtoList_ShouldMapAllItems()
    {
        // Arrange
        var sectors = new[] { SectorFactory.CreateSector().Value, SectorFactory.CreateSector().Value };

        // Act
        var dtos = sectors.ToDtoList();

        // Assert
        Assert.NotNull(dtos);
        Assert.Equal(2, dtos.Count);
    }
}
