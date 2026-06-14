using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Features.Companies.Dtos;
using ANNUAIRECONGO.Application.Features.Companies.Mappers;
using ANNUAIRECONGO.Domain.Analytics;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Companies;
using ANNUAIRECONGO.Domain.Subscriptions.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Companies.Queries.GetCompanyBySlugQuery;

public sealed record GetCompanyBySlugQueryHandler(
    IAppDbContext context,
    ILogger<GetCompanyBySlugQueryHandler> logger,
    IUser currentUser) : IRequestHandler<GetCompanyBySlugQuery, Result<CompanyDto>>
{
    private readonly IAppDbContext _context = context;
    private readonly ILogger<GetCompanyBySlugQueryHandler> _logger = logger;
    private readonly IUser _currentUser = currentUser;

    public async Task<Result<CompanyDto>> Handle(GetCompanyBySlugQuery request, CancellationToken cancellationToken)
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

        var viewerCanSeeDocuments = await ResolveDocumentAccessAsync(company, cancellationToken);
        return company.ToDto(viewerCanSeeDocuments);
    }

    /// <summary>
    /// Returns true when the current caller is allowed to see document download URLs.
    ///
    /// Access rules (first match wins):
    ///   0. Admin role         - always granted (platform admins oversee all content).
    ///   1. Company owner      - always granted (they own the documents).
    ///   2. Authenticated viewer with an active paid subscription (Plan.Price > 0)
    ///      on any of their own companies - granted.
    ///   3. Everyone else (anonymous visitors, free-plan users) - denied.
    ///      The document entry is still returned; only FileUrl is null.
    /// </summary>
    private async Task<bool> ResolveDocumentAccessAsync(Company company, CancellationToken ct)
    {
        // Rule 0 - platform admins always see all documents
        if (_currentUser.IsInRole("Admin")) return true;

        var viewerId = _currentUser.Id;
        if (viewerId is null) return false; // anonymous

        if (!Guid.TryParse(viewerId, out var viewerGuid)) return false;

        // Rule 1 - the company's own owner always sees their documents
        if (company.OwnerId == viewerGuid) return true;

        // Rule 2a - BusinessOwner with an active paid company subscription
        var hasCompanySub = await _context.Subscriptions
            .AnyAsync(s =>
                s.Company.OwnerId == viewerGuid &&
                (s.Status == SubscriptionStatus.Active || s.Status == SubscriptionStatus.ExpiringSoon) &&
                s.Plan.Price > 0 &&
                s.ExpiresAt > DateTimeOffset.UtcNow,
                ct);

        if (hasCompanySub) return true;

        // Rule 2b - RegularUser with an active paid UserSubscription
        return await _context.UserSubscriptions
            .AnyAsync(s =>
                s.UserId == viewerGuid &&
                (s.Status == SubscriptionStatus.Active || s.Status == SubscriptionStatus.ExpiringSoon) &&
                s.Plan.Price > 0 &&
                s.ExpiresAt > DateTimeOffset.UtcNow,
                ct);
    }
}
