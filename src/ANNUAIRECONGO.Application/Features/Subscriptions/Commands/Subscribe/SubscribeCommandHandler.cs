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
        // Admin Rule 0 — Admin can subscribe any company regardless of OwnerId.
        // Admin-managed companies have a BusinessOwner contact record whose Guid
        // does NOT match any user ID, so the normal ownership query would always fail.
        var isAdmin = currentUser.IsInRole("Admin");

        Company? company;

        if (isAdmin)
        {
            // Admin path: load by company ID only, no ownership filter
            company = await context.Companies
                .FirstOrDefaultAsync(c => c.Id == request.CompanyId, ct);

            if (company is null)
                return CompanyErrors.CompanyNotFound(request.CompanyId);
        }
        else
        {
            if (!Guid.TryParse(currentUser.Id, out var ownerGuid))
            {
                logger.LogWarning("Invalid User ID format: {UserId}", currentUser.Id);
                return CompanyErrors.NotOwner;
            }

            // 1. Validate company exists and belongs to current user
            company = await context.Companies
                .FirstOrDefaultAsync(c => c.Id == request.CompanyId && c.OwnerId == ownerGuid, ct);

            if (company is null)
            {
                var exists = await context.Companies.AnyAsync(c => c.Id == request.CompanyId, ct);
                if (exists)
                {
                    logger.LogWarning("Ownership check failed for Company {CompanyId}. CurrentUserId: {CurrentUserId}",
                        request.CompanyId, currentUser.Id);
                    return CompanyErrors.NotOwner;
                }
                return CompanyErrors.CompanyNotFound(request.CompanyId);
            }
        }

        // 2. Validate plan exists and is active
        var plan = await context.Plans
            .FirstOrDefaultAsync(p => p.Id == request.PlanId && p.IsActive, ct);
        if (plan is null)
            return PlanErrors.NotFound(request.PlanId);

        // 3. Cancel any existing active subscription (upgrade / plan-change flow).
        //    A new user who registers gets a Free plan auto-activated; upgrading
        //    to Pro/Premium must cancel that first subscription before creating
        //    the new one — otherwise AlreadyActive would permanently block changes.
        var existingActive = await context.Subscriptions
            .Include(s => s.Company)
            .FirstOrDefaultAsync(s =>
                s.CompanyId == request.CompanyId &&
                (s.Status == SubscriptionStatus.Active ||
                 s.Status == SubscriptionStatus.ExpiringSoon), ct);

        if (existingActive is not null)
        {
            var cancelResult = existingActive.Cancel();
            if (cancelResult.IsError)
            {
                logger.LogWarning("Could not cancel existing subscription {SubId} for upgrade: {Error}",
                    existingActive.Id, cancelResult.Errors.First().Description);
                return cancelResult.Errors;
            }
            // Clear the company's pointer to the now-cancelled subscription
            company.ClearActiveSubscription();
            logger.LogInformation("Existing subscription {SubId} cancelled for plan upgrade on company {CompanyId}",
                existingActive.Id, request.CompanyId);
        }

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
