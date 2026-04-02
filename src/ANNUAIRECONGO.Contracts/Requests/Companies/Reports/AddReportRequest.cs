using ANNUAIRECONGO.Contracts.Common;

namespace ANNUAIRECONGO.Contracts.Requests.Companies.Reports;

public class AddReportRequest
{
    public string ReporterIp { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
}