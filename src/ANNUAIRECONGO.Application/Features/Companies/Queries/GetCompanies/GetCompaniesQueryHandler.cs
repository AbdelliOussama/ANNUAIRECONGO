using ANNUAIRECONGO.Application.Common;
using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Features.Companies.Dtos;
using ANNUAIRECONGO.Application.Features.Companies.Mappers;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Companies;
using ANNUAIRECONGO.Domain.Companies.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Companies.Queries.GetCompanies;

public sealed record GetCompaniesQueryHandler(ILogger<GetCompaniesQueryHandler> Logger, IAppDbContext context, IGrokService grokService) : IRequestHandler<GetCompaniesQuery, Result<PaginatedList<CompanyDto>>>
{
    private readonly IAppDbContext _context = context;

    private readonly ILogger<GetCompaniesQueryHandler> _logger = Logger;
    
    private readonly IGrokService _grokService = grokService;

    public async Task<Result<PaginatedList<CompanyDto>>> Handle(GetCompaniesQuery request, CancellationToken cancellationToken)
    {
        string? searchTerm = request.SearchTerm;
        Guid? sectorId = request.SectorId;
        string? sectorSlug = request.SectorSlug;
        Guid? cityId = request.CityId;
        Guid? regionId = request.RegionId;
        string? regionName = request.RegionName;

        if (!string.IsNullOrWhiteSpace(request.SmartSearch))
        {
            _logger.LogInformation("Processing Smart Search (IA): '{SmartSearch}'", request.SmartSearch);
            try
            {
                var extracted = await _grokService.ExtractSearchFiltersAsync(request.SmartSearch, cancellationToken);
                _logger.LogInformation("Smart Search Extracted: Term='{Term}', Sector='{Sector}', City='{City}'", 
                    extracted.SearchTerm, extracted.SectorName, extracted.CityName);

                if (!string.IsNullOrWhiteSpace(extracted.SearchTerm))
                {
                    searchTerm = extracted.SearchTerm;
                }

                if (!string.IsNullOrWhiteSpace(extracted.CityName))
                {
                    var targetCityName = extracted.CityName.Trim().ToLower();
                    var foundCity = await _context.Cities
                        .AsNoTracking()
                        .FirstOrDefaultAsync(c => c.Name.ToLower() == targetCityName, cancellationToken);
                    if (foundCity != null)
                    {
                        cityId = foundCity.Id;
                    }
                }

                if (!string.IsNullOrWhiteSpace(extracted.SectorName))
                {
                    var targetSectorName = extracted.SectorName.Trim().ToLower();
                    var foundSector = await _context.Sectors
                        .AsNoTracking()
                        .FirstOrDefaultAsync(s => s.Name.ToLower() == targetSectorName || s.Slug.ToLower() == targetSectorName, cancellationToken);
                    if (foundSector != null)
                    {
                        sectorId = foundSector.Id;
                        sectorSlug = null; // Clear slug since we resolved ID
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing Smart Search with Groq API. Falling back to regular search.");
                searchTerm = request.SmartSearch; // Fallback
            }
        }

        var query = _context.Companies.AsNoTracking()
            .Include(c => c.Owner)
            .Include(c => c.CompanySectors)
            .ThenInclude(cs => cs.Sector)
            .Include(c => c.City)
            .ThenInclude(c => c.Region)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            query = query.Where(c =>
                c.Name.Contains(searchTerm) ||
                (c.Description != null && c.Description.Contains(searchTerm)) ||
                (c.Address != null && c.Address.Contains(searchTerm))
                || (c.Rccm != null && c.Rccm.Contains(searchTerm)) ||
                (c.Niu != null && c.Niu.Contains(searchTerm))   
            );
        }

        bool needSectorFilter = sectorId.HasValue || !string.IsNullOrWhiteSpace(sectorSlug);
        bool needRegionFilter = regionId.HasValue;
        bool needCityFilter = cityId.HasValue;
        bool needStatusFilter = request.Status.HasValue;
        bool needRccmFilter = request.Rccm != null;
        bool needNiuFilter = request.Niu != null;


        _logger.LogInformation("GetCompanies Query: Search={Search}, SectorId={SectorId}, SectorSlug={SectorSlug}, RegionId={RegionId}, RegionName={RegionName}", 
            searchTerm, sectorId, sectorSlug, regionId, regionName);

        if (needSectorFilter)
        {
            if (sectorId.HasValue)
            {
                query = query.Where(c => c.CompanySectors.Any(cs => cs.SectorId == sectorId.Value));
            }
            else if (!string.IsNullOrWhiteSpace(sectorSlug))
            {
                var slug = sectorSlug.Trim().ToLower();
                query = query.Where(c => c.CompanySectors.Any(cs => cs.Sector.Slug.ToLower() == slug));
            }
        }

        if (needCityFilter)
        {
            query = query.Where(c => c.CityId == cityId.Value);
        }

        if (needRegionFilter)
        {
            query = query.Where(c => c.City.RegionId == regionId.Value);
        }
        else if (!string.IsNullOrWhiteSpace(regionName))
        {
            var name = regionName.Trim().ToLower();
            var region = await _context.Regions
                .AsNoTracking()
                .FirstOrDefaultAsync(r => r.Name.ToLower() == name, cancellationToken);
            
            if (region != null)
            {
                query = query.Where(c => c.City.RegionId == region.Id);
            }
        }

        if (needStatusFilter)
        {
            var statusValue = (CompanyStatus)request.Status.Value;
            query = query.Where(c => c.Status == statusValue);
        }
        else 
        {
            // Default to Active status for the directory listings if not specified
            query = query.Where(c => c.Status == CompanyStatus.Active);
        }

        if(needRccmFilter)
        {
            query = query.Where(c => c.Rccm == request.Rccm);
        }
        if(needNiuFilter)
        {
            query = query.Where(c => c.Niu == request.Niu);
        }

        // Apply Sorting
        // Always prioritize Premium companies in the directory
        var orderedQuery = query.OrderByDescending(c => c.IsPremium);

        if (!string.IsNullOrWhiteSpace(request.SortBy))
        {
            var isDescending = string.Equals(request.SortOrder, "desc", StringComparison.OrdinalIgnoreCase);
            
            orderedQuery = request.SortBy.ToLower() switch
            {
                "name" => isDescending ? orderedQuery.ThenByDescending(c => c.Name) : orderedQuery.ThenBy(c => c.Name),
                "date" => isDescending ? orderedQuery.ThenByDescending(c => c.CreatedAtUtc) : orderedQuery.ThenBy(c => c.CreatedAtUtc),
                "status" => isDescending ? orderedQuery.ThenByDescending(c => c.Status) : orderedQuery.ThenBy(c => c.Status),
                _ => orderedQuery.ThenByDescending(c => c.CreatedAtUtc)
            };
        }
        else
        {
            // Default sort: Newest first
            orderedQuery = orderedQuery.ThenByDescending(c => c.CreatedAtUtc);
        }

        var totalCount = await orderedQuery.CountAsync(cancellationToken);
        var companies = await orderedQuery
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        // Map to DTOs even if the list is empty, to preserve TotalCount for pagination
        var companiesDto = companies?.ToDtoList() ?? new List<CompanyDto>();

        var paginatedList = new PaginatedList<CompanyDto>
        {
            Items = companiesDto,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize,
            TotalCount = totalCount,
            TotalPages = (int)Math.Ceiling(totalCount / (double)request.PageSize)
        };

        if (!companiesDto.Any() && totalCount > 0)
        {
            _logger.LogWarning("Requested page {PageNumber} returned no companies, but total count is {TotalCount}", request.PageNumber, totalCount);
        }

        return paginatedList;
    }
}
