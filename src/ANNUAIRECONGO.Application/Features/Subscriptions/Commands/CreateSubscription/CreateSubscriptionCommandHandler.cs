using ANNUAIRECONGO.Application.Features.Subscriptions.Dtos;
using ANNUAIRECONGO.Application.Common.Interfaces;
using MediatR;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Subscriptions;
using ANNUAIRECONGO.Domain.Subscriptions.Plans;
using ANNUAIRECONGO.Domain.Subscriptions.Enums;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using ANNUAIRECONGO.Application.Features.Subscriptions.Mappers;
using ANNUAIRECONGO.Domain.Companies;

namespace ANNUAIRECONGO.Application.Features.Subscriptions.Commands.CreateSubscription;
public sealed class CreateSubscriptionCommandHandler(ILogger<CreateSubscriptionCommandHandler> logger, IAppDbContext context) : IRequestHandler<CreateSubscriptionCommand, Result<SubscriptionDto>>
{
    private readonly ILogger<CreateSubscriptionCommandHandler> _logger = logger;
    private readonly IAppDbContext _context = context;

    public async Task<Result<SubscriptionDto>> Handle(CreateSubscriptionCommand request, CancellationToken cancellationToken)
    {
        var plan = await context.Plans.AsNoTracking().FirstOrDefaultAsync(p => p.Id == request.PlanId, cancellationToken);
        if (plan is null)
            return PlanErrors.NotFound(request.PlanId);
        var company = await context.Companies.AsNoTracking().FirstOrDefaultAsync(c => c.Id == request.CompanyId, cancellationToken);
        if (company is null)
            return CompanyErrors.CompanyNotFound(request.CompanyId);

        var subscriptionResult = Subscription.Create(
            Guid.NewGuid(),
            request.CompanyId,
            request.PlanId,
            plan.DurationDays);

        if (subscriptionResult.IsError)
        {
            _logger.LogWarning("Failed to create subscription for CompanyId: {CompanyId}, PlanId: {PlanId}. Errors: {Errors}",
                request.CompanyId, request.PlanId, subscriptionResult.Errors);
            return subscriptionResult.Errors;
        }

        var subscription = subscriptionResult.Value;

        _context.Subscriptions.Add(subscription);
        _logger.LogInformation("Created subscription with Id: {SubscriptionId} for CompanyId: {CompanyId} on PlanId: {PlanId}",
            subscription.Id, request.CompanyId, request.PlanId);
        await _context.SaveChangesAsync(cancellationToken);
        return subscription.ToDto();
    }
}