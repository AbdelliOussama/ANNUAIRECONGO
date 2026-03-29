using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Features.Companies.Dtos;
using ANNUAIRECONGO.Application.Features.Companies.Mappers;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Companies;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Hybrid;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Companies.Commands.PlanManagment.SetActiveSubscription;

public sealed record SetActiveSubscriptionCommandHandler(
    ILogger<SetActiveSubscriptionCommandHandler> logger,
    IAppDbContext context,
    HybridCache cache,
    IUser currentUser) : IRequestHandler<SetActiveSubscriptionCommand, Result<Updated>>
{
    private ILogger<SetActiveSubscriptionCommandHandler> _logger = logger;
    private IAppDbContext _context  = context;
    private HybridCache _cache = cache;
    private IUser _currentUser = currentUser;


    public async Task<Result<Updated>> Handle(SetActiveSubscriptionCommand request, CancellationToken cancellationToken)
    {
        var company = await context.Companies
            .Include(c => c.Subscriptions)
            .FirstOrDefaultAsync(c => c.Id == request.CompanyId, cancellationToken);

        if (company is null)
        {
            _logger.LogWarning("Company with id {CompanyId} not found", request.CompanyId);
            return CompanyErrors.CompanyNotFound(request.CompanyId);
        }
        var isOwnedByCurrentUser = company.IsOwnedBy(_currentUser.Id);
        if (!isOwnedByCurrentUser)
        {
            _logger.LogWarning("Company with id = {CompanyId} is not owned by the current user with id = {UserId}",    request.CompanyId, _currentUser.Id);
            return CompanyErrors.NotOwner;
        }
        // Verify subscription belongs to company
        var subscription = company.Subscriptions.FirstOrDefault(s => s.Id == request.SubscriptionId);
        if (subscription is null)
        {
            _logger.LogWarning("Subscription with id {SubscriptionId} not found for company {CompanyId}", request.SubscriptionId, request.CompanyId);
            return CompanyErrors.CompanyNotFound(request.CompanyId); // Temporary fix - will add proper error
        }

        var result = company.SetActiveSubscription(request.SubscriptionId);
        if (result.IsError)
        {
            _logger.LogError("Failed to set active subscription for company errors = {Errors}", result.Errors);
            return result.Errors;
        }

        await context.SaveChangesAsync(cancellationToken);
        await cache.RemoveByTagAsync("company");
        return Result.Updated;
    }
}