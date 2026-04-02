using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.Companies.Commands.Reports.AddReport;

public sealed record AddReportCommand(Guid CompanyId, string ReporterIp, string Reason) : IRequest<Result<Updated>>;