using ANNUAIRECONGO.AnnuaireCongo.Tests.Common.BusinessOwners;
using ANNUAIRECONGO.Application.Features.BusinessOwners.Mappers;
using Xunit;

namespace AnnuaireCongo.Application.UnitTests.Mappers;

public class BusinessOwnerMapperTests
{
    [Fact]
    public void BusinessOwner_ToDto_ShouldMapPropertiesCorrectly()
    {
        // Arrange
        var bo = BusinessOwnerFactory.CreateBusinessOwner().Value;

        // Act
        var dto = bo.ToDto();

        // Assert
        Assert.NotNull(dto);
        Assert.Equal(bo.Id, dto.BusinessOwnerId);
        Assert.Equal(bo.FirstName, dto.FirstName);
        Assert.Equal(bo.LastName, dto.LastName);
        Assert.Equal(bo.Phone, dto.Phone);
        Assert.Equal(bo.Email, dto.Email);
        Assert.Equal(bo.CompanyPosition, dto.CompanyPosition);
    }

    [Fact]
    public void BusinessOwnerList_ToDtoList_ShouldMapAllItems()
    {
        // Arrange
        var bos = new[] { BusinessOwnerFactory.CreateBusinessOwner().Value };

        // Act
        var dtos = bos.ToDtoList();

        // Assert
        Assert.NotNull(dtos);
        Assert.Single(dtos);
    }
}
