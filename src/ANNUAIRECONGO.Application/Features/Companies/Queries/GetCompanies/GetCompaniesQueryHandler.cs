using ANNUAIRECONGO.Application.Common;
using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Features.Companies.Dtos;
using ANNUAIRECONGO.Application.Features.Companies.Mappers;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Companies;
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
        var query = _context.Companies.AsNoTracking().Include(c => c.CompanySectors)
                        .Include(c => c.City).AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            query = query.Where(c =>
                c.Name.Contains(request.SearchTerm) ||
                c.Description.Contains(request.SearchTerm) ||
                c.Address.Contains(request.SearchTerm));
        }

        bool needSectorFilter = request.SectorId.HasValue;
        bool needRegionFilter = request.RegionId.HasValue;
        bool needCityFilter = request.CityId.HasValue;

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

        var totalCount = await query.CountAsync(cancellationToken);
        var companies = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        if (companies is null || !companies.Any())
        {
            _logger.LogWarning("No companies found");
            return new PaginatedList<CompanyDto>
            {
                Items = new List<CompanyDto>(),
                PageNumber = request.PageNumber,
                PageSize = request.PageSize,
                TotalCount = 0,
                TotalPages = 0
            };
        }

        var companiesDto = companies.ToDTos();
        var paginatedList = new PaginatedList<CompanyDto>
        {
            Items = companiesDto,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize,
            TotalCount = totalCount,
            TotalPages = (int)Math.Ceiling(totalCount / (double)request.PageSize)
        };

        return paginatedList;
    }
}