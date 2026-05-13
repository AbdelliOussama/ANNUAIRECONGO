using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Companies;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Companies.Commands.Reports.ProcessReport;

public sealed record ProcessReportCommandHandler(IAppDbContext Context, ILogger<ProcessReportCommandHandler> Logger) : IRequestHandler<ProcessReportCommand, Result<Updated>>
{
    private readonly IAppDbContext _context = Context;
    private readonly ILogger<ProcessReportCommandHandler> _logger = Logger;

    public async Task<Result<Updated>> Handle(ProcessReportCommand request, CancellationToken cancellationToken)
    {
        var report = await _context.CompanyReports.FirstOrDefaultAsync(r => r.Id == request.ReportId, cancellationToken);

        if (report is null)
        {
            _logger.LogWarning("CompanyReport with id {ReportId} not found", request.ReportId);
            return Error.NotFound("Report.NotFound", $"Report with id {request.ReportId} not found");
        }

        var result = request.Dismiss ? report.Dismiss() : report.MarkReviewed();

        if (result.IsError)
        {
            return result;
        }

        await _context.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Report {ReportId} processed. Dismissed: {Dismiss}", request.ReportId, request.Dismiss);

        return Result.Updated;
    }
}
