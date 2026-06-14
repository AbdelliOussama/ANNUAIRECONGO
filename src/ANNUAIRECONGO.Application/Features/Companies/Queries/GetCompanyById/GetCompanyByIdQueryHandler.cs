using ANNUAIRECONGO.Application.Common.Errors;
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

namespace ANNUAIRECONGO.Application.Features.Companies.Queries.GetCompanyById;

public sealed record GetCompanyByIdQueryHandler(
    ILogger<GetCompanyByIdQueryHandler> logger,
    IAppDbContext context,
    IPublisher publisher,
    IUser currentUser) : IRequestHandler<GetCompanyByIdQuery, Result<CompanyDto>>
{
    private readonly ILogger<GetCompanyByIdQueryHandler> _logger = logger;
    private readonly IAppDbContext _context = context;
    private readonly IPublisher _publisher = publisher;
    private readonly IUser _currentUser = currentUser;

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
            // Audit fix #4 - load subscriptions + plan so CompanyMapper can
            // populate the nested ActiveSubscription DTO for the FE.
            .Include(c => c.Subscriptions)
            .ThenInclude(s => s.Plan)
            .FirstOrDefaultAsync(c => c.Id == request.id, cancellationToken);

        if (company is null)
        {
            logger.LogWarning("Company with id {Id} not found", request.id);
            return CompanyErrors.CompanyNotFound(request.id);
        }

        // Publish event to track view (handled out-of-process or by a separate handler)
        await _publisher.Publish(new Domain.Companies.Events.CompanyViewedEvent(company.Id, request.viewerIp), cancellationToken);

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
        if (viewerId is null) return false;

        if (!Guid.TryParse(viewerId, out var viewerGuid)) return false;

        // Rule 1 - the company's own owner always sees their documents
        if (company.OwnerId == viewerGuid) return true;

        // Rule 2a - any BusinessOwner with an active paid company subscription
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
