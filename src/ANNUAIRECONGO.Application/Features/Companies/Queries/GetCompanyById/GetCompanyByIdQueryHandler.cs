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
    /// Same rules as GetCompanyBySlugQueryHandler - see that handler for full commentary.
    /// </summary>
    private async Task<bool> ResolveDocumentAccessAsync(Company company, CancellationToken ct)
    {
        var viewerId = _currentUser.Id;
        if (viewerId is null) return false;

        if (!Guid.TryParse(viewerId, out var viewerGuid)) return false;

        // Company owner always sees their own documents
        if (company.OwnerId == viewerGuid) return true;

        // Any other authenticated user needs an active paid subscription
        return await _context.Subscriptions
            .AnyAsync(s =>
                s.Company.OwnerId == viewerGuid &&
                (s.Status == SubscriptionStatus.Active || s.Status == SubscriptionStatus.ExpiringSoon) &&
                s.Plan.Price > 0 &&
                s.ExpiresAt > DateTimeOffset.UtcNow,
                ct);
    }
}
