namespace ANNUAIRECONGO.Application.Features.Companies.Dtos;

public record CompanyReportDto(
    Guid Id,
    Guid CompanyId,
    string CompanyName,
    string ReporterIp,
    string Reason,
    int Status,
    DateTimeOffset CreatedAt);
