using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Features.Subscriptions.Dtos;
using ANNUAIRECONGO.Application.Features.Subscriptions.Mappers;
using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Subscriptions.Queries.GetCompanySubscriptions;

public sealed class GetCompanySubscriptionsQueryHandler(ILogger<GetCompanySubscriptionsQueryHandler> logger, IAppDbContext context) : IRequestHandler<GetCompanySubscriptionsQuery, Result<List<SubscriptionDto>>>
{
    private readonly ILogger<GetCompanySubscriptionsQueryHandler> _logger = logger;
    private readonly IAppDbContext _context = context;

    public async Task<Result<List<SubscriptionDto>>> Handle(GetCompanySubscriptionsQuery request, CancellationToken cancellationToken)
    {
        var subscriptions = await _context.Subscriptions
            .Include(s => s.Plan)
            .Where(s => s.CompanyId == request.CompanyId)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        if (subscriptions is null || !subscriptions.Any())
            return new List<SubscriptionDto>();

        return subscriptions.ToDtos();
    }
}