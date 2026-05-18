using AnnuaireCongo.Tests.Common.Companies;
using ANNUAIRECONGO.Application.Features.Companies.Mappers;
using Xunit;

namespace AnnuaireCongo.Application.UnitTests.Mappers;

public class CompanyMapperTests
{
    [Fact]
    public void Company_ToDto_ShouldMapPropertiesCorrectly()
    {
        // Arrange
        var company = CompanyFactory.CreateCompany().Value;

        // Act
        var dto = company.ToDto();

        // Assert
        Assert.NotNull(dto);
        Assert.Equal(company.Id, dto.Id);
        Assert.Equal(company.OwnerId, dto.OwnerId);
        Assert.Equal(company.Name, dto.Name);
        Assert.Equal(company.Slug, dto.Slug);
        Assert.Equal(company.Description, dto.Description);
        Assert.Equal(company.LogoUrl, dto.LogoUrl);
        Assert.Equal(company.CoverUrl, dto.CoverUrl);
        Assert.Equal(company.Website, dto.Website);
        Assert.Equal(company.CityId, dto.CityId);
        Assert.Equal(company.Address, dto.Address);
        Assert.Equal(company.Latitude, dto.Latitude);
        Assert.Equal(company.Longitude, dto.Longitude);
        Assert.Equal(company.Status, dto.Status);
        Assert.Equal(company.RejectionReason, dto.RejectionReason);
        Assert.Equal(company.IsFeatured, dto.IsFeatured);
        Assert.Equal(company.IsVerified, dto.IsVerified);
        Assert.Equal(company.IsPremium, dto.IsPremium);
        Assert.Equal(company.SubmittedAt, dto.SubmittedAt);
        Assert.Equal(company.Rccm, dto.Rccm);
        Assert.Equal(company.Niu, dto.Niu);
        Assert.Equal(company.YearFounded, dto.YearFounded);
        Assert.Equal(company.CreatedAtUtc, dto.CreatedAtUtc);
        Assert.Equal(company.LastModifiedUtc, dto.LastModifiedUtc);
        Assert.Equal(company.ActiveSubscriptionId, dto.ActiveSubscriptionId);
        
        Assert.NotNull(dto.Sectors);
        Assert.NotNull(dto.Services);
        Assert.NotNull(dto.Contacts);
        Assert.NotNull(dto.Images);
        Assert.NotNull(dto.Documents);
    }

    [Fact]
    public void CompanyList_ToDtoList_ShouldMapAllItems()
    {
        // Arrange
        var companies = new[] { CompanyFactory.CreateCompany().Value };

        // Act
        var dtos = companies.ToDtoList();

        // Assert
        Assert.NotNull(dtos);
        Assert.Single(dtos);
    }
}
