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

public sealed record GetCompaniesQueryHandler(ILogger<GetCompaniesQueryHandler> Logger, IAppDbContext context) : IRequestHandler<GetCompaniesQuery, Result<PaginatedList<CompanyDto>>>
{
    private readonly IAppDbContext _context = context;

    private readonly ILogger<GetCompaniesQueryHandler> _logger = Logger;

    public async Task<Result<PaginatedList<CompanyDto>>> Handle(GetCompaniesQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Companies.AsNoTracking()
            .Include(c => c.Owner)
            .Include(c => c.CompanySectors)
            .ThenInclude(cs => cs.Sector)
            .Include(c => c.City)
            .ThenInclude(c => c.Region)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            query = query.Where(c =>
                c.Name.Contains(request.SearchTerm) ||
                (c.Description != null && c.Description.Contains(request.SearchTerm)) ||
                (c.Address != null && c.Address.Contains(request.SearchTerm))
                || (c.Rccm != null && c.Rccm.Contains(request.SearchTerm)) ||
                (c.Niu != null && c.Niu.Contains(request.SearchTerm))   
            );
        }

        bool needSectorFilter = request.SectorId.HasValue;
        bool needRegionFilter = request.RegionId.HasValue;
        bool needCityFilter = request.CityId.HasValue;
        bool needStatusFilter = request.Status.HasValue;
        bool needRccmFilter = request.Rccm != null;
        bool needNiuFilter = request.Niu != null;


        if (needSectorFilter)
        {
            query = query.Where(c => c.CompanySectors.Any(cs => cs.SectorId == request.SectorId.Value));
        }

        if (needCityFilter)
        {
            query = query.Where(c => c.CityId == request.CityId.Value);
        }

        if (needRegionFilter)
        {
            query = query.Where(c => c.City.RegionId == request.RegionId.Value);
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
