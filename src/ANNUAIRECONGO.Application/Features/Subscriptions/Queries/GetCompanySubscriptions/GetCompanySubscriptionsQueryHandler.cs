using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Features.Subscriptions.Dtos;
using ANNUAIRECONGO.Application.Features.Subscriptions.Mappers;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Companies;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Subscriptions.Queries.GetCompanySubscriptions;

public sealed class GetCompanySubscriptionsQueryHandler(ILogger<GetCompanySubscriptionsQueryHandler> logger, IAppDbContext context, IUser currentUser) : IRequestHandler<GetCompanySubscriptionsQuery, Result<List<SubscriptionDto>>>
{
    private readonly ILogger<GetCompanySubscriptionsQueryHandler> _logger = logger;
    private readonly IAppDbContext _context = context;
    private readonly IUser _currentUser = currentUser;

    public async Task<Result<List<SubscriptionDto>>> Handle(GetCompanySubscriptionsQuery request, CancellationToken cancellationToken)
    {
        var userId = request.UserId ?? _currentUser.Id;
        _logger.LogInformation("GetCompanySubscriptions: Checking ownership. CompanyId: {CompanyId}, CurrentUserId: {CurrentUserId}", 
            request.CompanyId, userId);

        var isOwner = await _context.Companies
            .AnyAsync(c => c.Id == request.CompanyId && c.OwnerId.ToString() == userId, cancellationToken);
        
        if (!isOwner)
        {
             _logger.LogWarning("Ownership check failed for Company {CompanyId}. Resolved UserId: {CurrentUserId}", 
                request.CompanyId, userId);
             
             // Check if company exists at all to return 404 vs 403
             var exists = await _context.Companies.AnyAsync(c => c.Id == request.CompanyId, cancellationToken);
             return exists ? CompanyErrors.NotOwner : CompanyErrors.CompanyNotFound(request.CompanyId);
        }

        var subscriptions = await _context.Subscriptions
            .Include(s => s.Plan)
            .Include(s => s.Company)
            .Where(s => s.CompanyId == request.CompanyId)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        if (subscriptions is null || !subscriptions.Any())
            return new List<SubscriptionDto>();

        return subscriptions.ToDtoList();
    }
}
