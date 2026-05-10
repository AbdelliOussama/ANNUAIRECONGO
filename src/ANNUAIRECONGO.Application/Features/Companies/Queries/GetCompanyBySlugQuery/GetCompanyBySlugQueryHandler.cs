using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Features.Companies.Dtos;
using ANNUAIRECONGO.Application.Features.Companies.Mappers;
using ANNUAIRECONGO.Domain.Analytics;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Companies;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Companies.Queries.GetCompanyBySlugQuery;

public sealed record GetCompanyBySlugQueryHandler(IAppDbContext context, ILogger<GetCompanyBySlugQueryHandler> logger) : IRequestHandler<GetCompanyBySlugQuery, Result<CompanyDto>>
{
    private readonly IAppDbContext _context = context;
    private readonly ILogger<GetCompanyBySlugQueryHandler> _logger = logger;
    public async  Task<Result<CompanyDto>> Handle(GetCompanyBySlugQuery request, CancellationToken cancellationToken)
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
            .Include(c => c.Subscriptions)
            .ThenInclude(s => s.Plan)
            .FirstOrDefaultAsync(c => c.Slug == request.Slug, cancellationToken);
        if (company is null)
        {
            _logger.LogWarning("Company with slug {Slug} not found", request.Slug);
            return CompanyErrors.NotFoundBySlug;
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