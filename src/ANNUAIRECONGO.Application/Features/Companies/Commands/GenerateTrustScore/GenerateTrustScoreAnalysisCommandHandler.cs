using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Features.Companies.Dtos;
using ANNUAIRECONGO.Application.Features.Companies.Mappers;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Companies;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Hybrid;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace ANNUAIRECONGO.Application.Features.Companies.Commands.GenerateTrustScore;

public sealed class GenerateTrustScoreAnalysisCommandHandler : IRequestHandler<GenerateTrustScoreAnalysisCommand, Result<CompanyDto>>
{
    private readonly IAppDbContext _context;
    private readonly IGrokService _grokService;
    private readonly HybridCache _cache;
    private readonly ILogger<GenerateTrustScoreAnalysisCommandHandler> _logger;

    public GenerateTrustScoreAnalysisCommandHandler(
        IAppDbContext context,
        IGrokService grokService,
        HybridCache cache,
        ILogger<GenerateTrustScoreAnalysisCommandHandler> logger)
    {
        _context = context;
        _grokService = grokService;
        _cache = cache;
        _logger = logger;
    }

    public async Task<Result<CompanyDto>> Handle(GenerateTrustScoreAnalysisCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Generating AI trust score analysis for company {CompanyId}", request.CompanyId);

        // 1. Fetch Company with all related items for completeness calculation
        var company = await _context.Companies
            .Include(c => c.City)
            .ThenInclude(c => c.Region)
            .Include(c => c.CompanySectors)
            .ThenInclude(cs => cs.Sector)
            .Include(c => c.Services)
            .Include(c => c.Contacts)
            .Include(c => c.Images)
            .Include(c => c.Documents)
            .Include(c => c.Reports)
            .FirstOrDefaultAsync(x => x.Id == request.CompanyId, cancellationToken);

        if (company is null)
        {
            _logger.LogWarning("Company {CompanyId} not found for trust score analysis", request.CompanyId);
            return CompanyErrors.CompanyNotFound(request.CompanyId);
        }

        // 2. Calculate Profile Completeness Percentage
        double completeness = 0;
        if (!string.IsNullOrWhiteSpace(company.LogoUrl)) completeness += 10;
        if (!string.IsNullOrWhiteSpace(company.CoverUrl)) completeness += 10;
        if (!string.IsNullOrWhiteSpace(company.Description)) completeness += 10;
        if (!string.IsNullOrWhiteSpace(company.Website)) completeness += 10;
        if (!string.IsNullOrWhiteSpace(company.Address)) completeness += 10;
        if (company.Latitude.HasValue && company.Longitude.HasValue) completeness += 10;
        if (company.Contacts.Any()) completeness += 10;
        if (company.Services.Any()) completeness += 10;
        if (company.Images.Any()) completeness += 10;
        if (!string.IsNullOrWhiteSpace(company.Rccm) || !string.IsNullOrWhiteSpace(company.Niu)) completeness += 10;

        // 3. Calculate Age
        int ageYears = 0;
        if (company.YearFounded.HasValue)
        {
            ageYears = Math.Max(0, DateTime.UtcNow.Year - company.YearFounded.Value);
        }

        // 4. Trigger Groq Live AI Trust Score & Justification
        var aiResult = await _grokService.GenerateTrustScoreAnalysisAsync(
            company.Name,
            !string.IsNullOrWhiteSpace(company.Rccm),
            !string.IsNullOrWhiteSpace(company.Niu),
            company.Documents.Count,
            company.Services.Count,
            company.Images.Count,
            company.Reports.Count,
            ageYears,
            completeness,
            request.ManualScore,
            cancellationToken);

        // 5. Update Domain Properties
        var transitionResult = company.SetTrustScore(aiResult.Score, aiResult.Analysis);
        if (transitionResult.IsError)
        {
            _logger.LogError("Failed to transition TrustScore for company {CompanyId}", company.Id);
            return transitionResult.Errors;
        }

        // 6. Save changes to DB
        await _context.SaveChangesAsync(cancellationToken);
        
        // 7. Flush hybrid cache tag
        await _cache.RemoveByTagAsync("Company", cancellationToken);

        _logger.LogInformation("Successfully analyzed TrustScore for company {CompanyId} -> Score: {Score}", company.Id, aiResult.Score);

        return company.ToDto();
    }
}
