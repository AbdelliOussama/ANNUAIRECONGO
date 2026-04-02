using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Companies;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Companies.Commands.Reports.AddReport;

public sealed record AddReportCommandHandler(IAppDbContext Context, ILogger<AddReportCommandHandler> logger, IUser user) : IRequestHandler<AddReportCommand, Result<Updated>>
{
    private readonly IAppDbContext _context = Context;
    private readonly ILogger<AddReportCommandHandler> _logger = logger;
    private readonly IUser _user = user;

    public async Task<Result<Updated>> Handle(AddReportCommand request, CancellationToken cancellationToken)
    {
        var company = await _context.Companies.FirstOrDefaultAsync(c => c.Id == request.CompanyId, cancellationToken);

        if (company is null)
        {
            _logger.LogWarning("Company with id {CompanyId} not found", request.CompanyId);
            return CompanyErrors.CompanyNotFound(request.CompanyId);
        }

        // Check if reporting is allowed - based on SFD, authenticated users and possibly anonymous can flag companies
        // For now, we'll allow any authenticated user to report a company
        var userId = _user.Id;
        if (string.IsNullOrEmpty(userId))
        {
            // Anonymous user - we'll allow reporting but might want to implement rate limiting or other restrictions
            _logger.LogInformation("Anonymous user reporting company with id {CompanyId}", request.CompanyId);
        }
        else
        {
            // Authenticated user - check if they've already reported this company recently (optional)
            // For now, we'll allow multiple reports from the same user
        }

        var report = CompanyReport.Create(request.CompanyId, request.ReporterIp, request.Reason);
        if (report.IsError)
        {
            _logger.LogWarning("Failed to create report for company with id {CompanyId}. Errors: {Errors}", request.CompanyId, report.Errors);
            return CompanyErrors.InvalidReportData;
        }

        // Call AddReport with reporterIp and reason parameters
        var result = company.AddReport(request.ReporterIp, request.Reason);
        if (result.IsError)
        {
            _logger.LogWarning("Failed to add report for company with id {CompanyId}. Errors: {Errors}", request.CompanyId, result.Errors);
            return result;
        }

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Report added to company with id {CompanyId}", request.CompanyId);

        return Result.Updated;
    }
}