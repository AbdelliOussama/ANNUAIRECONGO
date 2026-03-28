using ANNUAIRECONGO.Application.Features.Subscriptions.Dtos;
using ANNUAIRECONGO.Application.Common.Interfaces;
using MediatR;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Subscriptions;
using ANNUAIRECONGO.Domain.Subscriptions.Plans;
using ANNUAIRECONGO.Domain.Subscriptions.Enums;

namespace ANNUAIRECONGO.Application.Features.Subscriptions.Commands.CreateSubscription;

public sealed class CreateSubscriptionCommandHandler(
    IAppDbContext context) : IRequestHandler<CreateSubscriptionCommand, Result<SubscriptionDto>>
{
    public async Task<Result<SubscriptionDto>> Handle(CreateSubscriptionCommand request, CancellationToken cancellationToken)
    {
        var subscriptionResult = Subscription.Create(
            request.CompanyId,
            request.PlanId,
            request.DurationDays);

        if (subscriptionResult.IsError)
            return subscriptionResult.Errors;

        var subscription = subscriptionResult.Value;

        context.Subscriptions.Add(subscription);
        await context.SaveChangesAsync(cancellationToken);

        var plan = await context.Plans.FindAsync(new object[] { request.PlanId }, cancellationToken);
        if (plan is null)
            return PlanErrors.NotFound(request.PlanId);

        var subscriptionDto = new SubscriptionDto(
            subscription.Id,
            subscription.CompanyId,
            subscription.PlanId,
            plan.Name.ToString(),
            subscription.Status,
            subscription.StartedAt,
            subscription.ExpiresAt,
            subscription.Status == SubscriptionStatus.Active || subscription.Status == SubscriptionStatus.ExpiringSoon);

        return subscriptionDto;
    }
}