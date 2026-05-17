using AnnuaireCongo.Tests.Common.Sectors;
using AnnuaireCongo.Tests.Common.Geography;
using ANNUAIRECONGO.Domain.Geography;
using ANNUAIRECONGO.Domain.Sectors;
using Xunit;

namespace AnnuaireCongo.Domain.UnitTests.Geography;

public class RegionTests
{
    [Fact]
    public void Create_WithValidData_ShouldSucceed()
    {
        var result = RegionFactory.CreateRegion();

        Assert.False(result.IsError);
        Assert.Equal("Brazzaville", result.Value.Name);
        Assert.False(string.IsNullOrWhiteSpace(result.Value.Slug));
    }

    [Fact]
    public void Create_WithEmptyId_ShouldReturnError()
    {
        var result = Region.Create(Guid.Empty, "Brazzaville");
        Assert.True(result.IsError);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WithBlankName_ShouldReturnError(string? name)
    {
        var result = Region.Create(Guid.NewGuid(), name!);
        Assert.True(result.IsError);
    }

    [Fact]
    public void Create_ShouldGenerateSlugFromName()
    {
        var result = RegionFactory.CreateRegion(name: "Pointe-Noire");

        Assert.False(result.IsError);
        Assert.Equal("pointe-noire", result.Value.Slug);
    }

    [Fact]
    public void Update_WithNewName_ShouldUpdateNameAndSlug()
    {
        var region = RegionFactory.CreateRegion().Value;

        var result = region.Update("Kouilou");

        Assert.False(result.IsError);
        Assert.Equal("Kouilou", region.Name);
        Assert.Equal("kouilou", region.Slug);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    public void Update_WithBlankName_ShouldReturnError(string? name)
    {
        var region = RegionFactory.CreateRegion().Value;
        var result = region.Update(name!);
        Assert.True(result.IsError);
    }
}

public class CityTests
{
    [Fact]
    public void Create_WithValidData_ShouldSucceed()
    {
        var result = CityFactory.CreateCity();

        Assert.False(result.IsError);
        Assert.Equal("Makélékélé", result.Value.Name);
        Assert.False(string.IsNullOrWhiteSpace(result.Value.Slug));
    }

    [Fact]
    public void Create_WithEmptyId_ShouldReturnError()
    {
        var result = City.Create(Guid.Empty, Guid.NewGuid(), "Makélékélé");
        Assert.True(result.IsError);
    }

    [Fact]
    public void Create_WithEmptyRegionId_ShouldReturnError()
    {
        var result = City.Create(Guid.NewGuid(), Guid.Empty, "Makélékélé");
        Assert.True(result.IsError);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WithBlankName_ShouldReturnError(string? name)
    {
        var result = City.Create(Guid.NewGuid(), Guid.NewGuid(), name!);
        Assert.True(result.IsError);
    }

    [Fact]
    public void Create_ShouldAssociateCorrectRegionId()
    {
        var regionId = Guid.NewGuid();
        var result = CityFactory.CreateCity(regionId: regionId);

        Assert.False(result.IsError);
        Assert.Equal(regionId, result.Value.RegionId);
    }

    [Fact]
    public void Update_WithNewName_ShouldUpdateNameAndSlug()
    {
        var city = CityFactory.CreateCity().Value;

        var result = city.Update("Poto-Poto");

        Assert.False(result.IsError);
        Assert.Equal("Poto-Poto", city.Name);
    }
}

public class SectorTests
{
    [Fact]
    public void Create_WithValidData_ShouldSucceed()
    {
        var result = SectorFactory.CreateSector();

        Assert.False(result.IsError);
        Assert.Equal("Maritime & Portuaire", result.Value.Name);
        Assert.Equal("maritime", result.Value.Slug);
        Assert.True(result.Value.IsActive);
    }

    [Fact]
    public void Create_WithEmptyId_ShouldReturnError()
    {
        var result = Sector.Create(Guid.Empty, "Maritime & Portuaire");
        Assert.True(result.IsError);
    }

    [Fact]
    public void Create_WithNullName_ShouldReturnError()
    {
        var result = Sector.Create(Guid.NewGuid(), null!);
        Assert.True(result.IsError);
    }

    [Fact]
    public void Deactivate_WhenActive_ShouldSetIsActiveToFalse()
    {
        var sector = SectorFactory.CreateSector().Value;
        Assert.True(sector.IsActive);

        var result = sector.Deactivate();

        Assert.False(result.IsError);
        Assert.False(sector.IsActive);
    }

    [Fact]
    public void Activate_AfterDeactivate_ShouldSetIsActiveToTrue()
    {
        var sector = SectorFactory.CreateSector().Value;
        sector.Deactivate();

        var result = sector.Activate();

        Assert.False(result.IsError);
        Assert.True(sector.IsActive);
    }

    [Fact]
    public void Update_WithNewData_ShouldUpdateProperties()
    {
        var sector = SectorFactory.CreateSector().Value;

        var result = sector.Update("Logistique & Transport", "Transport et logistique", "local_shipping", "logistique");

        Assert.False(result.IsError);
        Assert.Equal("Logistique & Transport", sector.Name);
        Assert.Equal("logistique", sector.Slug);
    }
}
