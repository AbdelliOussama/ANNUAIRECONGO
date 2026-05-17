using ANNUAIRECONGO.AnnuaireCongo.Tests.Common.BusinessOwners;
using ANNUAIRECONGO.Domain.Identity;
using ANNUAIRECONGO.Domain.BusinessOwners;
using Xunit;

namespace AnnuaireCongo.Domain.UnitTests.BusinessOwners;

public class BusinessOwnerTests
{
    // ── Create ────────────────────────────────────────────────────────────────

    [Fact]
    public void Create_WithValidData_ShouldSucceed()
    {
        // Act
        var result = BusinessOwnerFactory.CreateBusinessOwner();

        // Assert
        Assert.False(result.IsError);
        Assert.Equal("John", result.Value.FirstName);
        Assert.Equal("Doe", result.Value.LastName);
        Assert.Equal("john.doe@example.com", result.Value.Email);
        Assert.Equal(Role.EntrepriseOwner, result.Value.Role);
    }

    [Fact]
    public void Create_WithEmptyId_ShouldReturnError()
    {
        // Act
        var result = BusinessOwner.Create(Guid.Empty, "John", "Doe", "john.doe@example.com", "555-1234", null, Role.EntrepriseOwner);

        // Assert
        Assert.True(result.IsError);
        Assert.Equal(BusinessOwnerErrors.IdRequired.Code, result.TopError.Code);
        Assert.Equal(BusinessOwnerErrors.IdRequired.Description, result.TopError.Description);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WithBlankFirstName_ShouldReturnError(string? firstName)
    {
        // Act
        var result = BusinessOwner.Create(Guid.NewGuid(), firstName!, "Doe", "john.doe@example.com", "555-1234", null, Role.EntrepriseOwner);

        // Assert
        Assert.True(result.IsError);
        Assert.Equal(BusinessOwnerErrors.FirstNameRequired.Code, result.TopError.Code);
        Assert.Equal(BusinessOwnerErrors.FirstNameRequired.Description, result.TopError.Description);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WithBlankLastName_ShouldReturnError(string? lastName)
    {
        // Act
        var result = BusinessOwner.Create(Guid.NewGuid(), "John", lastName!, "john.doe@example.com", "555-1234", null, Role.EntrepriseOwner);

        // Assert
        Assert.True(result.IsError);
        Assert.Equal(BusinessOwnerErrors.LastNameRequired.Code, result.TopError.Code);
        Assert.Equal(BusinessOwnerErrors.LastNameRequired.Description, result.TopError.Description);
    }

    // ── UpdateProfile ─────────────────────────────────────────────────────────

    [Fact]
    public void UpdateProfile_WithValidData_ShouldUpdateProperties()
    {
        // Arrange
        var bo = BusinessOwnerFactory.CreateBusinessOwner().Value;

        // Act
        var result = bo.UpdateProfile("Marie", "Moussavou", "+242 06 700 1234", "Directrice Générale");

        // Assert
        Assert.False(result.IsError);
        Assert.Equal("Marie", bo.FirstName);
        Assert.Equal("Moussavou", bo.LastName);
        Assert.Equal("+242 06 700 1234", bo.Phone);
        Assert.Equal("Directrice Générale", bo.CompanyPosition);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    public void UpdateProfile_WithBlankFirstName_ShouldReturnError(string? firstName)
    {
        // Arrange
        var bo = BusinessOwnerFactory.CreateBusinessOwner().Value;

        // Act
        var result = bo.UpdateProfile(firstName!, "Doe", "555-0000", null);

        // Assert
        Assert.True(result.IsError);
        Assert.Equal(BusinessOwnerErrors.FirstNameRequired.Code, result.TopError.Code);
        Assert.Equal(BusinessOwnerErrors.FirstNameRequired.Description, result.TopError.Description);
    }
}
