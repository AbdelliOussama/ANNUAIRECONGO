using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Features.Subscriptions.Payments.Dtos;
using ANNUAIRECONGO.Application.Features.Subscriptions.Payments.Mappers;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Companies;
using ANNUAIRECONGO.Domain.Subscriptions.Payments;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Subscriptions.Payments.Queries.GetCompanyPayments;

public sealed class GetCompanyPaymentsQueryHandler(ILogger<GetCompanyPaymentsQueryHandler> logger,IUser currentUser, IAppDbContext context) : IRequestHandler<GetCompanyPaymentsQuery, Result<List<PaymentDto>>>
{
    private readonly ILogger<GetCompanyPaymentsQueryHandler> _logger = logger;
    private readonly IAppDbContext _context = context;
    private readonly IUser _currentUser = currentUser;
    public async Task<Result<List<PaymentDto>>> Handle(GetCompanyPaymentsQuery request, CancellationToken cancellationToken)
    {
        var userId = request.UserId ?? _currentUser.Id;
        _logger.LogInformation("GetCompanyPayments: Checking ownership. CompanyId: {CompanyId}, CurrentUserId: {CurrentUserId}", 
            request.CompanyId, userId);

        if (!Guid.TryParse(userId, out var ownerGuid))
        {
            _logger.LogWarning("Invalid User ID format: {UserId}", userId);
            return CompanyErrors.NotOwner;
        }

        var isOwner = await _context.Companies
            .AnyAsync(c => c.Id == request.CompanyId && c.OwnerId == ownerGuid, cancellationToken);
        
        if (!isOwner)
        {
             _logger.LogWarning("Ownership check failed for Company {CompanyId}. Resolved UserId: {CurrentUserId}", 
                request.CompanyId, userId);
             
             // Check if company exists at all to return 404 vs 403
             var exists = await _context.Companies.AnyAsync(c => c.Id == request.CompanyId, cancellationToken);
             return exists ? CompanyErrors.NotOwner : CompanyErrors.CompanyNotFound(request.CompanyId);
        }

        var payments = await _context.Payments
            .Include(p => p.Subscription)
            .ThenInclude(s => s.Company)
            // Audit fix #1 — Plan join lets the mapper expose PaymentDto.PlanName
            // so the FE historique table renders the "Forfait" column without
            // a second round-trip to /api/v1/plans.
            .Include(p => p.Subscription)
            .ThenInclude(s => s.Plan)
            .Where(p => p.CompanyId == request.CompanyId)
            .OrderByDescending(p => p.CreatedAtUtc)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        if (payments is null || !payments.Any())
        {
            _logger.LogInformation("No payments found for company {CompanyId}", request.CompanyId);
            return new List<PaymentDto>();
        }

        return payments.ToDtoList();
    }
}
