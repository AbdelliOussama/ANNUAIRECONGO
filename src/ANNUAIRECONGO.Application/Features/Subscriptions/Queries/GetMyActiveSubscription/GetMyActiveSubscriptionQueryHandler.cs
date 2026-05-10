namespace ANNUAIRECONGO.Application.Features.Subscriptions.Queries.GetMyActiveSubscription;

using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Features.Subscriptions.Dtos;
using ANNUAIRECONGO.Application.Features.Subscriptions.Mappers;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Companies;
using ANNUAIRECONGO.Domain.Subscriptions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

public sealed record GetMyActiveSubscriptionQueryHandler(ILogger<GetMyActiveSubscriptionQueryHandler> logger, IAppDbContext context, IUser currentUser) : IRequestHandler<GetMyActiveSubscriptionQuery, Result<SubscriptionDto>>
{
    private readonly ILogger<GetMyActiveSubscriptionQueryHandler> _logger = logger;
    private readonly IAppDbContext _context = context;
    private readonly IUser _currentUser = currentUser;

    public async Task<Result<SubscriptionDto>> Handle(GetMyActiveSubscriptionQuery request, CancellationToken cancellationToken)
    {
        var company = await _context.Companies
            .Include(c => c.Subscriptions)
            .FirstOrDefaultAsync(c => c.Id == request.CompanyId, cancellationToken);

        if (company is null)
            return CompanyErrors.CompanyNotFound(request.CompanyId);
        if (!company.IsOwnedBy(_currentUser.Id!))
            return CompanyErrors.NotOwner;

        var subscription = await _context.Subscriptions
            .Include(s => s.Plan)
            .Include(s => s.Company)
            .Where(s => s.CompanyId == request.CompanyId)
            .AsNoTracking()
            .FirstOrDefaultAsync(cancellationToken);

        if (subscription is null)
            return SubscriptionErrors.NotFound(request.CompanyId);

        return subscription.ToDto();
    }
}
