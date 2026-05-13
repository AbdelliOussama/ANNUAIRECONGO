using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.Companies.Commands.Reports.ProcessReport;

public sealed record ProcessReportCommand(Guid ReportId, bool Dismiss) : IRequest<Result<Updated>>;
