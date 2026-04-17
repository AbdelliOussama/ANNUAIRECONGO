using ANNUAIRECONGO.Application.Common.Errors;
using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Features.Companies.Dtos;
using ANNUAIRECONGO.Application.Features.Companies.Mappers;
using ANNUAIRECONGO.Domain.Analytics;
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
            .Include(c => c.Services)
            .Include(c => c.Contacts)
            .Include(c => c.Images)
            .Include(c => c.Documents)
            .FirstOrDefaultAsync(c => c.Id == request.id, cancellationToken);
        if (company is null)
        {
            logger.LogWarning("Company with id {Id} not found", request.id);
            return CompanyErrors.CompanyNotFound(request.id);
        }
        var profileViewResult = ProfileView.Create(company.Id, request.viewerIp);
        if (!profileViewResult.IsError)
        {
            await _context.ProfileViews.AddAsync(profileViewResult.Value, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);
        }
        else
        {
            _logger.LogWarning("ProfileView creation skipped: {Error}", profileViewResult.Errors.First().Description);
        }
        return company.ToDto();
    }
}