using AnnuaireCongo.Tests.Common.Companies;
using ANNUAIRECONGO.Domain.Companies;
using ANNUAIRECONGO.Domain.Companies.Enums;
using Xunit;

namespace AnnuaireCongo.Domain.UnitTests.Companies;

public class CompanyTests
{
    // ── Create ────────────────────────────────────────────────────────────────

    [Fact]
    public void Create_WithValidData_ShouldSucceed()
    {
        // Act
        var result = CompanyFactory.CreateCompany();

        // Assert
        Assert.False(result.IsError);
        Assert.Equal("Entreprise Test SARL", result.Value.Name);
        Assert.Equal(CompanyStatus.Draft, result.Value.Status);
        Assert.False(result.Value.IsFeatured);
        Assert.False(result.Value.IsVerified);
    }

    [Fact]
    public void Create_WithEmptyName_ShouldThrowArgumentException()
    {
        // Assert
        Assert.Throws<ArgumentException>(() => CompanyFactory.CreateCompany(name: ""));
    }

    [Fact]
    public void Create_WithEmptyDescription_ShouldThrowArgumentException()
    {
        // Assert
        Assert.Throws<ArgumentException>(() => CompanyFactory.CreateCompany(description: ""));
    }

    [Fact]
    public void Create_WithSectorIds_ShouldAttachSectors()
    {
        // Arrange
        var sectorId1 = Guid.NewGuid();
        var sectorId2 = Guid.NewGuid();

        // Act
        var result = CompanyFactory.CreateCompany(sectorIds: [sectorId1, sectorId2]);

        // Assert
        Assert.False(result.IsError);
        Assert.Equal(2, result.Value.CompanySectors.Count);
    }

    // ── Status Transitions ────────────────────────────────────────────────────

    [Fact]
    public void Submit_FromDraft_ShouldTransitionToPending()
    {
        // Arrange
        var company = CompanyFactory.CreateCompany().Value;
        Assert.Equal(CompanyStatus.Draft, company.Status);

        // Act
        var result = company.Submit();

        // Assert
        Assert.False(result.IsError);
        Assert.Equal(CompanyStatus.Pending, company.Status);
        Assert.NotNull(company.SubmittedAt);
    }

    [Fact]
    public void Submit_FromPending_ShouldReturnError()
    {
        // Arrange
        var company = CompanyFactory.CreateCompany().Value;
        company.Submit(); // Move to Pending first

        // Act
        var result = company.Submit();

        // Assert
        Assert.True(result.IsError);
    }

    [Fact]
    public void Validate_FromPending_ShouldTransitionToActive()
    {
        // Arrange
        var company = CompanyFactory.CreateCompany().Value;
        company.Submit();

        // Act
        var result = company.Validate();

        // Assert
        Assert.False(result.IsError);
        Assert.Equal(CompanyStatus.Active, company.Status);
    }

    [Fact]
    public void Reject_FromPending_ShouldTransitionToRejected()
    {
        // Arrange
        var company = CompanyFactory.CreateCompany().Value;
        company.Submit();

        // Act
        var result = company.Reject("Informations non vérifiables.");

        // Assert
        Assert.False(result.IsError);
        Assert.Equal(CompanyStatus.Rejected, company.Status);
        Assert.Equal("Informations non vérifiables.", company.RejectionReason);
    }

    [Fact]
    public void Suspend_FromActive_ShouldTransitionToSuspended()
    {
        // Arrange
        var company = CompanyFactory.CreateCompany().Value;
        company.Submit();
        company.Validate();

        // Act
        var result = company.Suspend();

        // Assert
        Assert.False(result.IsError);
        Assert.Equal(CompanyStatus.Suspended, company.Status);
    }

    // ── Media ──────────────────────────────────────────────────────────────────

    [Fact]
    public void UpdateMedia_ShouldSetLogoAndCoverUrls()
    {
        // Arrange
        var company = CompanyFactory.CreateCompany().Value;
        const string logoUrl = "https://storage.test.cg/logos/logo.png";
        const string coverUrl = "https://storage.test.cg/covers/cover.jpg";

        // Act
        var result = company.UpdateMedia(logoUrl, coverUrl);

        // Assert
        Assert.False(result.IsError);
        Assert.Equal(logoUrl, company.LogoUrl);
        Assert.Equal(coverUrl, company.CoverUrl);
    }
}

public class CompanyContactTests
{
    [Fact]
    public void Create_WithValidData_ShouldSucceed()
    {
        var result = CompanyContactFactory.CreateCompanyContact();
        Assert.False(result.IsError);
        Assert.Equal(ContactType.Phone, result.Value.Type);
        Assert.True(result.Value.IsPrimary);
    }
}

public class CompanyDocumentTests
{
    [Fact]
    public void Create_WithValidUrl_ShouldSucceed()
    {
        var result = CompanyDocumentFactory.CreateCompanyDocument();
        Assert.False(result.IsError);
        Assert.Equal(DocumentType.RCCM, result.Value.DocType);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WithBlankFileUrl_ShouldReturnError(string? fileUrl)
    {
        var result = CompanyDocument.Create(Guid.NewGuid(), DocumentType.RCCM, fileUrl!, false);
        Assert.True(result.IsError);
    }
}

public class CompanyImageTests
{
    [Fact]
    public void Create_WithValidUrl_ShouldSucceed()
    {
        var result = CompanyImageFactory.CreateCompanyImage();
        Assert.False(result.IsError);
        Assert.Equal(1, result.Value.DisplayOrder);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    public void Create_WithBlankImageUrl_ShouldReturnError(string? imageUrl)
    {
        var result = CompanyImage.Create(Guid.NewGuid(), imageUrl!, 1, null);
        Assert.True(result.IsError);
    }

    [Fact]
    public void UpdateOrder_ShouldChangeDisplayOrder()
    {
        var image = CompanyImageFactory.CreateCompanyImage().Value;
        var result = image.UpdateOrder(3);
        Assert.False(result.IsError);
        Assert.Equal(3, image.DisplayOrder);
    }
}

public class CompanyReportTests
{
    [Fact]
    public void Create_WithValidData_ShouldStartAsPending()
    {
        var result = CompanyReportFactory.CreateCompanyReport();
        Assert.False(result.IsError);
        Assert.Equal(ReportStatus.Pending, result.Value.Status);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    public void Create_WithBlankReporterIp_ShouldReturnError(string? ip)
    {
        var result = CompanyReport.Create(Guid.NewGuid(), ip!, "Reason");
        Assert.True(result.IsError);
    }

    [Fact]
    public void Dismiss_ShouldChangeToDismissed()
    {
        var report = CompanyReportFactory.CreateCompanyReport().Value;
        var result = report.Dismiss();
        Assert.False(result.IsError);
        Assert.Equal(ReportStatus.Dismissed, report.Status);
    }

    [Fact]
    public void MarkReviewed_ShouldChangeToReviewed()
    {
        var report = CompanyReportFactory.CreateCompanyReport().Value;
        var result = report.MarkReviewed();
        Assert.False(result.IsError);
        Assert.Equal(ReportStatus.Reviewed, report.Status);
    }
}

public class CompanyServiceTests
{
    [Fact]
    public void Create_WithValidData_ShouldSucceed()
    {
        var result = CompanyServiceFactory.CreateCompanyService();
        Assert.False(result.IsError);
        Assert.Equal("Transport maritime international", result.Value.Title);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WithBlankTitle_ShouldReturnError(string? title)
    {
        var result = CompanyService.Create(Guid.NewGuid(), Guid.NewGuid(), title!, null);
        Assert.True(result.IsError);
    }
}
