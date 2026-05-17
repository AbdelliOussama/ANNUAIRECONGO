using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Companies;

namespace AnnuaireCongo.Tests.Common.Companies;

public static class CompanyReportFactory
{
    public static Result<CompanyReport> CreateCompanyReport(
        Guid? companyId = null,
        string? reporterIp = null,
        string? reason = null)
    {
        return CompanyReport.Create(
            companyId ?? Guid.NewGuid(),
            reporterIp ?? "192.168.1.100",
            reason ?? "Informations incorrectes ou trompeuses."
        );
    }
}
