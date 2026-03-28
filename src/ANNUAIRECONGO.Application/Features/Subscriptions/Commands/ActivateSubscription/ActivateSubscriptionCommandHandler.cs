using ANNUAIRECONGO.Application.Features.Subscriptions.Dtos;
using ANNUAIRECONGO.Application.Common.Interfaces;
using MediatR;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Subscriptions;
using ANNUAIRECONGO.Domain.Subscriptions.Enums;
using Microsoft.EntityFrameworkCore;

namespace ANNUAIRECONGO.Application.Features.Subscriptions.Commands.ActivateSubscription;

public sealed class ActivateSubscriptionCommandHandler(
    IAppDbContext context) : IRequestHandler<ActivateSubscriptionCommand, Result<SubscriptionDto>>
{
    public async Task<Result<SubscriptionDto>> Handle(ActivateSubscriptionCommand request, CancellationToken cancellationToken)
    {
        var subscription = await context.Subscriptions
            .Include(s => s.Plan)
            .FirstOrDefaultAsync(s => s.Id == request.SubscriptionId, cancellationToken);

        if (subscription is null)
            return SubscriptionErrors.NotFound(request.SubscriptionId);

        var activateResult = subscription.Activate(request.OwnerId, subscription.Plan.Name.ToString());
        if (activateResult.IsError)
            return activateResult.Errors;

        await context.SaveChangesAsync(cancellationToken);

        var subscriptionDto = new SubscriptionDto(
            subscription.Id,
            subscription.CompanyId,
            subscription.PlanId,
            subscription.Plan.Name.ToString(),
            subscription.Status,
            subscription.StartedAt,
            subscription.ExpiresAt,
            subscription.Status == SubscriptionStatus.Active || subscription.Status == SubscriptionStatus.ExpiringSoon);

        return subscriptionDto;
    }
}