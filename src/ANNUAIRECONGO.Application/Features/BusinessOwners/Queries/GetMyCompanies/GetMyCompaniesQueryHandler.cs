using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Features.Companies.Dtos;
using ANNUAIRECONGO.Application.Features.Companies.Mappers;
using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.BusinessOwners.Queries.GetMyCompanies;

public sealed record GetMyCompaniesQueryHandler(IAppDbContext Context, ILogger<GetMyCompaniesQueryHandler> Logger, IUser currentUser) : IRequestHandler<GetMyCompaniesQuery, Result<List<CompanyFollowDto>>>
{
    private readonly IAppDbContext _context = Context;
    private readonly ILogger<GetMyCompaniesQueryHandler> _logger = Logger;
    private readonly IUser _currentUser = currentUser;


    public async Task<Result<List<CompanyFollowDto>>> Handle(GetMyCompaniesQuery request, CancellationToken cancellationToken)
    {
        if(string.IsNullOrEmpty(_currentUser.Id))
        {
            _logger.LogWarning("Current user ID is null or empty. Cannot retrieve companies.");
            return new List<CompanyFollowDto>();
        }
        var companies = await _context.Companies.AsNoTracking()
            .Include(c => c.City)
            .ThenInclude(c => c.Region)
            .Include(c => c.CompanySectors)
            .ThenInclude(cs => cs.Sector)
            .Where(c => c.OwnerId.ToString() == _currentUser.Id)
            .ToListAsync(cancellationToken);

        if(companies is null || !companies.Any())
        {
            _logger.LogInformation("No companies found for user with ID {UserId}", _currentUser.Id);
            return new List<CompanyFollowDto>();
        }
        return companies.ToDTos();
    }
}