using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Features.Companies.Dtos;
using ANNUAIRECONGO.Application.Features.Companies.Mappers;
using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.BusinessOwners.Queries.GetMyCompanies;

public sealed record GetMyCompaniesQueryHandler(IAppDbContext Context, ILogger<GetMyCompaniesQueryHandler> Logger, IUser currentUser) : IRequestHandler<GetMyCompaniesQuery, Result<List<CompanyDto>>>
{
    private readonly IAppDbContext _context = Context;
    private readonly ILogger<GetMyCompaniesQueryHandler> _logger = Logger;
    private readonly IUser _currentUser = currentUser;


    public async Task<Result<List<CompanyDto>>> Handle(GetMyCompaniesQuery request, CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(_currentUser.Id, out var ownerGuid))
        {
            _logger.LogWarning("Invalid User ID format: {UserId}", _currentUser.Id);
            return new List<CompanyDto>();
        }

        var companies = await _context.Companies.AsNoTracking()
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
            .Where(c => c.OwnerId == ownerGuid)
            .ToListAsync(cancellationToken);

        if(companies is null || !companies.Any())
        {
            _logger.LogInformation("No companies found for user with ID {UserId}", _currentUser.Id);
            return new List<CompanyDto>();
        }
        return companies.ToDtoList();
    }
}
