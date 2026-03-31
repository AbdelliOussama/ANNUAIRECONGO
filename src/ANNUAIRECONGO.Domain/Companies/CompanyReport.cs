
using ANNUAIRECONGO.Domain.Common;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Companies.Enums;

namespace ANNUAIRECONGO.Domain.Companies;

public class CompanyReport : Entity
{
    public Guid CompanyId { get; private set; }
    public string ReporterIp { get; private set; } = string.Empty;
    public string Reason { get; private set; } = string.Empty;
    public ReportStatus Status { get; private set; }
    public DateTime CreatedAt { get; private set; }

    private CompanyReport() { }

    private CompanyReport(Guid companyId, string reporterIp, string reason)
    {
        CompanyId = companyId;
        ReporterIp = reporterIp;
        Reason = reason;
        Status = ReportStatus.Pending;
        CreatedAt = DateTime.UtcNow;
    }


    public static Result<CompanyReport> Create(
        Guid companyId,
        string reporterIp,
        string reason)
    {
        if (string.IsNullOrWhiteSpace(reporterIp))
            return CompanyErrors.ReporterIpRequired;

        if (string.IsNullOrWhiteSpace(reason))
            return CompanyErrors.ReasonRequired;

        return new CompanyReport(companyId, reporterIp, reason);
    }

    public Result<Updated> UpdateReason(string reason)
    {
        Reason = reason;
        return Result.Updated;
    }

    public Result<Updated> MarkReviewed()
    {
        Status = ReportStatus.Reviewed;
        return Result.Updated;
    }

    public Result<Updated> Dismiss()
    {
        Status = ReportStatus.Dismissed;
        return Result.Updated;
    }
}
