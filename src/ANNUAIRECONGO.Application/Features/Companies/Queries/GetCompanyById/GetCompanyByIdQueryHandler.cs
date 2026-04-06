using ANNUAIRECONGO.Application.Common.Errors;
using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Features.Companies.Dtos;
using ANNUAIRECONGO.Application.Features.Companies.Mappers;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Companies;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Companies.Queries.GetCompanyById;

public sealed record GetCompanyByIdQueryHandler(ILogger<GetCompanyByIdQueryHandler> logger,IAppDbContext context) : IRequestHandler<GetCompanyByIdQuery, Result<CompanyDto>>
{
    private readonly ILogger<GetCompanyByIdQueryHandler> _logger = logger;
    private readonly IAppDbContext _context = context;
    public async Task<Result<CompanyDto>> Handle(GetCompanyByIdQuery request, CancellationToken cancellationToken)
    {
        var company = await _context.Companies.AsNoTracking()
            .Include(c => c.City)
            .ThenInclude(c => c.Region)
            .Include(c => c.CompanySectors)
            .ThenInclude(cs => cs.Sector)
            // .Include(c =>c.Services)
            .FirstOrDefaultAsync(c => c.Id == request.id, cancellationToken);
        if (company is null)
        {
            logger.LogWarning("Company with id {Id} not found", request.id);
            return CompanyErrors.CompanyNotFound(request.id);
        }
        return company.ToDto();
    }
}