using ANNUAIRECONGO.Application.Common.Errors;
using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Common.Models;
using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace ANNUAIRECONGO.Application.Features.Sectors.Commands.GenerateSectorReport;

public sealed record GenerateSectorReportCommandHandler(
    ILogger<GenerateSectorReportCommandHandler> logger,
    IAppDbContext context,
    IGrokService grokService)
    : IRequestHandler<GenerateSectorReportCommand, Result<SectorIntelligenceReport>>
{
    private readonly IAppDbContext _context = context;
    private readonly IGrokService _grokService = grokService;
    private readonly ILogger<GenerateSectorReportCommandHandler> _logger = logger;

    public async Task<Result<SectorIntelligenceReport>> Handle(GenerateSectorReportCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Generating economic intelligence report for Sector: {SectorId}", request.SectorId);

        // 1. Fetch the sector
        var sector = await _context.Sectors
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == request.SectorId, cancellationToken);

        if (sector == null)
        {
            _logger.LogWarning("Sector with ID {SectorId} not found.", request.SectorId);
            return ApplicationErrors.SectorNotFound;
        }

        // 2. Aggregate real database statistics
        var totalCompanies = await _context.CompanySectors
            .CountAsync(cs => cs.SectorId == request.SectorId, cancellationToken);

        var cityDistribution = await _context.CompanySectors
            .Where(cs => cs.SectorId == request.SectorId)
            .GroupBy(cs => cs.Company.City.Name)
            .Select(g => new { City = g.Key, Count = g.Count() })
            .ToListAsync(cancellationToken);

        var nowUtc = DateTimeOffset.UtcNow;
        var startOfThisMonth = new DateTimeOffset(nowUtc.Year, nowUtc.Month, 1, 0, 0, 0, TimeSpan.Zero);
        var startOfLastMonth = startOfThisMonth.AddMonths(-1);

        var registeredThisMonth = await _context.CompanySectors
            .Where(cs => cs.SectorId == request.SectorId)
            .CountAsync(cs => cs.Company.CreatedAtUtc >= startOfThisMonth, cancellationToken);

        var registeredLastMonth = await _context.CompanySectors
            .Where(cs => cs.SectorId == request.SectorId)
            .CountAsync(cs => cs.Company.CreatedAtUtc >= startOfLastMonth && cs.Company.CreatedAtUtc < startOfThisMonth, cancellationToken);

        // 3. Package metrics into JSON context
        var statsContext = new
        {
            SectorName = sector.Name,
            TotalCompaniesRegistered = totalCompanies,
            RegistrationsThisMonth = registeredThisMonth,
            RegistrationsLastMonth = registeredLastMonth,
            GeographicalDistributionByCity = cityDistribution.Select(c => $"{c.City}: {c.Count}").ToList()
        };

        var statsJsonString = JsonSerializer.Serialize(statsContext, new JsonSerializerOptions { WriteIndented = true });
        _logger.LogInformation("Aggregated stats context: {StatsJson}", statsJsonString);

        // 4. Generate report using AI service
        try
        {
            var report = await _grokService.GenerateSectorReportAsync(sector.Name, statsJsonString, cancellationToken);
            _logger.LogInformation("Successfully generated AI sector report: {Title}", report.Title);
            return report;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error while calling AI to generate sector report.");
            return Error.Failure("AI.ReportError", "Impossible de générer le rapport pour le moment. Veuillez réessayer.");
        }
    }
}
