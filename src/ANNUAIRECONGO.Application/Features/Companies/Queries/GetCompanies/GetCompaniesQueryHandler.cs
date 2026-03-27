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
        var companies =await  _context.Companies.AsNoTracking().ToListAsync(cancellationToken);
        if(companies is null)
        {
            _logger.LogError("No companies found");
            return CompanyErrors.NoCompaniesFound;
        }
        var companiesDto = companies.ToDTos();
        var paginatedList = new PaginatedList<CompanyDto>
        {
            Items = companiesDto,
            PageNumber = 1,
            PageSize = 10,
            TotalCount = companiesDto.Count,
            TotalPages = (int)Math.Ceiling(companiesDto.Count / (double)10)
        };
        return paginatedList;
    }
}