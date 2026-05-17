using AnnuaireCongo.Tests.Common.Analytics;
using ANNUAIRECONGO.Domain.Companies.Enums;
using ANNUAIRECONGO.Domain.Analytics;
using Xunit;

namespace AnnuaireCongo.Domain.UnitTests.Analytics;

public class AnalyticsDailySummaryTests
{
    [Fact]
    public void Create_WithValidData_ShouldSucceed()
    {
        var result = AnalyticsDailySummaryFactory.CreateAnalyticsDailySummary();

        Assert.False(result.IsError);
        Assert.Equal(42, result.Value.ProfileViews);
        Assert.Equal(7, result.Value.ContactClicks);
        Assert.Equal(120, result.Value.SearchAppearances);
    }

    [Fact]
    public void Create_WithCustomDate_ShouldStoreCorrectDate()
    {
        var date = new DateOnly(2026, 1, 15);
        var result = AnalyticsDailySummaryFactory.CreateAnalyticsDailySummary(summaryDate: date);

        Assert.False(result.IsError);
        Assert.Equal(date, result.Value.SummaryDate);
    }

    [Fact]
    public void UpdateCounts_ShouldOverwriteAllMetrics()
    {
        var summary = AnalyticsDailySummaryFactory.CreateAnalyticsDailySummary().Value;

        var result = summary.UpdateCounts(100, 25, 300);

        Assert.False(result.IsError);
        Assert.Equal(100, summary.ProfileViews);
        Assert.Equal(25, summary.ContactClicks);
        Assert.Equal(300, summary.SearchAppearances);
    }

    [Fact]
    public void UpdateCounts_WithZeros_ShouldSucceed()
    {
        var summary = AnalyticsDailySummaryFactory.CreateAnalyticsDailySummary().Value;

        var result = summary.UpdateCounts(0, 0, 0);

        Assert.False(result.IsError);
        Assert.Equal(0, summary.ProfileViews);
    }
}

public class ContactClickTests
{
    [Fact]
    public void Create_WithValidData_ShouldSucceed()
    {
        var result = ContactClickFactory.CreateContactClick();

        Assert.False(result.IsError);
        Assert.Equal(ContactType.Phone, result.Value.ContactType);
        Assert.True(result.Value.ClickedAt <= DateTimeOffset.UtcNow);
    }

    [Theory]
    [InlineData(ContactType.Phone)]
    [InlineData(ContactType.Email)]
    [InlineData(ContactType.WhatsApp)]
    [InlineData(ContactType.Facebook)]
    [InlineData(ContactType.LinkedIn)]
    public void Create_WithEachContactType_ShouldSucceed(ContactType contactType)
    {
        var result = ContactClickFactory.CreateContactClick(contactType: contactType);

        Assert.False(result.IsError);
        Assert.Equal(contactType, result.Value.ContactType);
    }
}

public class ProfileViewTests
{
    [Fact]
    public void Create_WithValidIp_ShouldSucceed()
    {
        var result = ProfileViewFactory.CreateProfileView();

        Assert.False(result.IsError);
        Assert.Equal("41.202.208.15", result.Value.ViewerIp);
        Assert.True(result.Value.ViewedAt <= DateTimeOffset.UtcNow);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WithBlankIp_ShouldReturnError(string? ip)
    {
        var result = ProfileView.Create(Guid.NewGuid(), ip!);

        Assert.True(result.IsError);
    }

    [Fact]
    public void Create_WithDifferentCompanies_ShouldHaveCorrectCompanyId()
    {
        var companyId = Guid.NewGuid();
        var result = ProfileViewFactory.CreateProfileView(companyId: companyId);

        Assert.False(result.IsError);
        Assert.Equal(companyId, result.Value.CompanyId);
    }
}
