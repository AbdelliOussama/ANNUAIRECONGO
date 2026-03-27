using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Features.Companies.Dtos;
using ANNUAIRECONGO.Application.Features.Companies.Mappers;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Companies;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Hybrid;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Companies.Commands.PlanManagment.ClearActiveSubscription;

public sealed record ClearActiveSubscriptionCommandHandler(
    ILogger<ClearActiveSubscriptionCommandHandler> logger,
    IAppDbContext context,
    HybridCache cache) : IRequestHandler<ClearActiveSubscriptionCommand, Result<Updated>>
{
    private readonly ILogger<ClearActiveSubscriptionCommandHandler> _logger = logger;
    private readonly IAppDbContext _context = context;
    private readonly HybridCache _cache = cache;
    public async Task<Result<Updated>> Handle(ClearActiveSubscriptionCommand request, CancellationToken cancellationToken)
    {
        var company = await context.Companies
            .FirstOrDefaultAsync(c => c.Id == request.CompanyId, cancellationToken);

        if (company is null)
        {
            _logger.LogWarning("Company with id {CompanyId} not found", request.CompanyId);
            return CompanyErrors.CompanyNotFound(request.CompanyId);
        }

        var result = company.ClearActiveSubscription();
        if (result.IsError)
        {
            _logger.LogError("Failed to clear active subscription for company with id {CompanyId}", request.CompanyId);
            return result.Errors;
        }

        await context.SaveChangesAsync(cancellationToken);
        await cache.RemoveByTagAsync("company");
        return Result.Updated;
    }
}