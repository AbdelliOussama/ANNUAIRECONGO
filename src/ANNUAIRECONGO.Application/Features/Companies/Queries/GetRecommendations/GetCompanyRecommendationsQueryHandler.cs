using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Features.Companies.Dtos;
using ANNUAIRECONGO.Application.Features.Companies.Mappers;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Companies;
using ANNUAIRECONGO.Domain.Companies.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;

namespace ANNUAIRECONGO.Application.Features.Companies.Queries.GetRecommendations;

public sealed class GetCompanyRecommendationsQueryHandler : IRequestHandler<GetCompanyRecommendationsQuery, Result<List<CompanyDto>>>
{
    private readonly IAppDbContext _context;
    private readonly IGrokService _grokService;
    private readonly ILogger<GetCompanyRecommendationsQueryHandler> _logger;

    // French stop words list to clean description tokens
    private static readonly HashSet<string> StopWords = new(StringComparer.OrdinalIgnoreCase)
    {
        "le", "la", "les", "et", "de", "en", "pour", "un", "une", "du", "sur", "dans", "par", "au", "aux", 
        "avec", "ce", "ces", "d'", "l'", "s'", "se", "qui", "que", "qu'", "est", "sont", "ont", "a", "des"
    };

    public GetCompanyRecommendationsQueryHandler(IAppDbContext context, IGrokService grokService, ILogger<GetCompanyRecommendationsQueryHandler> logger)
    {
        _context = context;
        _grokService = grokService;
        _logger = logger;
    }

    public async Task<Result<List<CompanyDto>>> Handle(GetCompanyRecommendationsQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Getting similarity recommendations for company {CompanyId}", request.CompanyId);

        // 1. Fetch Target Company with full details
        var target = await _context.Companies.AsNoTracking()
            .Include(c => c.City)
            .Include(c => c.CompanySectors)
            .ThenInclude(cs => cs.Sector)
            .Include(c => c.Services)
            .FirstOrDefaultAsync(c => c.Id == request.CompanyId, cancellationToken);

        if (target == null)
        {
            _logger.LogWarning("Target company {CompanyId} not found", request.CompanyId);
            return CompanyErrors.CompanyNotFound(request.CompanyId);
        }

        // 2. Fetch Candidates: Published active companies other than target
        var candidates = await _context.Companies.AsNoTracking()
            .Include(c => c.City)
            .ThenInclude(c => c.Region)
            .Include(c => c.CompanySectors)
            .ThenInclude(cs => cs.Sector)
            .Include(c => c.Services)
            .Include(c => c.Contacts)
            .Include(c => c.Images)
            .Include(c => c.Documents)
            .Include(c => c.Subscriptions)
            .ThenInclude(s => s.Plan)
            .Where(c => c.Id != target.Id && c.Status == CompanyStatus.Active)
            .ToListAsync(cancellationToken);

        if (!candidates.Any())
        {
            return new List<CompanyDto>();
        }

        // 3. Vectorize target details in-memory and enrich with Groq AI Semantic Footprint
        var targetTokens = Tokenize(target.Description, target.Services.Select(s => s.Title + " " + s.Description));
        var targetSectorIds = target.CompanySectors.Select(cs => cs.SectorId).ToHashSet();

        try
        {
            var aiTags = await _grokService.ExtractSemanticKeywordsAsync(
                target.Name,
                target.Description,
                target.CompanySectors.Select(cs => cs.Sector?.Name ?? string.Empty),
                target.Services.Select(s => s.Title),
                cancellationToken);

            if (aiTags != null && aiTags.Any())
            {
                foreach (var tag in aiTags)
                {
                    targetTokens.Add(tag);
                }
                _logger.LogInformation("Enriched target company {CompanyId} similarity with {Count} Groq AI sémantique tags.", target.Id, aiTags.Count);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to enrich similarity matching with Groq AI semantic extraction, falling back to local NLP.");
        }

        // 4. Score each candidate
        var scoredCandidates = candidates.Select(c =>
        {
            double score = 0;

            // A. Primary Sector Match (40 pts)
            bool sharesSector = c.CompanySectors.Any(cs => targetSectorIds.Contains(cs.SectorId));
            if (sharesSector)
            {
                score += 40;
            }

            // B. City Location Match (20 pts)
            if (c.CityId == target.CityId)
            {
                score += 20;
            }

            // C. NLP Word Token Jaccard Match (30 pts max)
            var candidateTokens = Tokenize(c.Description, c.Services.Select(s => s.Title + " " + s.Description));
            double jaccard = ComputeJaccard(targetTokens, candidateTokens);
            score += jaccard * 30;

            // D. Quality Boosts (10 pts max)
            if (c.IsPremium) score += 5;
            if (c.IsVerified) score += 5;

            return new { Company = c, Score = score };
        });

        // 5. Take top 4, map to Dto
        var recommendedDtos = scoredCandidates
            .OrderByDescending(x => x.Score)
            .ThenByDescending(x => x.Company.IsPremium)
            .Take(4)
            .Select(x => x.Company.ToDto())
            .ToList();

        _logger.LogInformation("Found {Count} recommendations for company {CompanyId}", recommendedDtos.Count, target.Id);
        return recommendedDtos;
    }

    private static HashSet<string> Tokenize(string? description, IEnumerable<string> services)
    {
        var text = (description ?? string.Empty) + " " + string.Join(" ", services);
        if (string.IsNullOrWhiteSpace(text))
        {
            return new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        }

        // Clean punctuation, split into words
        var words = Regex.Matches(text.ToLower(), @"[a-zàâäéèêëîïôöùûüç\d]+")
            .Select(m => m.Value)
            .Where(w => w.Length > 2 && !StopWords.Contains(w));

        return new HashSet<string>(words, StringComparer.OrdinalIgnoreCase);
    }

    private static double ComputeJaccard(HashSet<string> setA, HashSet<string> setB)
    {
        if (setA.Count == 0 || setB.Count == 0) return 0;
        
        int intersectCount = setA.Intersect(setB).Count();
        int unionCount = setA.Union(setB).Count();

        return unionCount == 0 ? 0 : (double)intersectCount / unionCount;
    }
}
