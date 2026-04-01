using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Features.Subscriptions.Dtos;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Companies;
using ANNUAIRECONGO.Domain.Subscriptions;
using ANNUAIRECONGO.Domain.Subscriptions.Enums;
using ANNUAIRECONGO.Domain.Subscriptions.Payments;
using ANNUAIRECONGO.Domain.Subscriptions.Plans;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Subscriptions.Commands.Subscribe;

public sealed record SubscribeCommandHandler(
    IAppDbContext context,
    IUser currentUser,
    ILogger<SubscribeCommandHandler> logger)
    : IRequestHandler<SubscribeCommand, Result<SubscriptionWithPaymentDto>>
{
    public async Task<Result<SubscriptionWithPaymentDto>> Handle(
        SubscribeCommand request, CancellationToken ct)
    {
        // 1. Validate company exists and belongs to current user
        var company = await context.Companies
            .FirstOrDefaultAsync(c => c.Id == request.CompanyId, ct);
        if (company is null)
            return CompanyErrors.CompanyNotFound(request.CompanyId);
        if (!company.IsOwnedBy(currentUser.Id!))
            return CompanyErrors.NotOwner;

        // 2. Validate plan exists and is active
        var plan = await context.Plans
            .FirstOrDefaultAsync(p => p.Id == request.PlanId && p.IsActive, ct);
        if (plan is null)
            return PlanErrors.NotFound(request.PlanId);

        // 3. Check no active subscription already exists
        var hasActive = await context.Subscriptions.AnyAsync(s =>
            s.CompanyId == request.CompanyId &&
            (s.Status == SubscriptionStatus.Active ||
            s.Status == SubscriptionStatus.ExpiringSoon), ct);
        if (hasActive)
            return SubscriptionErrors.AlreadyActive;

        // 4. Create Subscription (Pending)
        var subscriptionResult = Subscription.Create(
            Guid.NewGuid(), request.CompanyId, request.PlanId, plan.DurationDays);
        if (subscriptionResult.IsError)
            return subscriptionResult.Errors;
        var subscription = subscriptionResult.Value;

        // 5. Create Payment immediately (Pending)
        var paymentResult = Payment.Create(
            Guid.NewGuid(), request.CompanyId, subscription.Id,
            plan.Price, "XAF", request.Method, null, null, null);
        if (paymentResult.IsError)
            return paymentResult.Errors;
        var payment = paymentResult.Value;

        // 6. Free plan: activate immediately, no payment needed
        if (plan.Price == 0)
        {
            subscription.Activate();
            company.SetActiveSubscription(subscription.Id);
            payment.MarkAsSucceeded(); // mark free plan payment as done
        }

        // 7. Save both in one transaction
        context.Subscriptions.Add(subscription);
        context.Payments.Add(payment);
        await context.SaveChangesAsync(ct);

        return new SubscriptionWithPaymentDto
        {
            SubscriptionId = subscription.Id,
            Status = subscription.Status,
            PaymentId = payment.Id,
            Amount = payment.Amount,
            Currency = payment.Currency,
            Method = payment.Method,
            PaymentDate = payment.PaidAt
        };
    }
}