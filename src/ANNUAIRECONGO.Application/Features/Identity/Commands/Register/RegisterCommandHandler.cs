using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Companies;
using ANNUAIRECONGO.Domain.Subscriptions;
using ANNUAIRECONGO.Domain.Subscriptions.Payments;
using ANNUAIRECONGO.Domain.Subscriptions.Payments.Enums;
using ANNUAIRECONGO.Domain.Subscriptions.Plans.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Identity.Commands.Register;

public sealed class RegisterCommandHandler(
    IIdentityService identityService,
    IAppDbContext context,
    ILogger<RegisterCommandHandler> logger) : IRequestHandler<RegisterCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        // 1. Register User & Create BusinessOwner
        var registerResult = await identityService.RegisterAsync(
            request.Email,
            request.Password,
            request.FirstName,
            request.LastName,
            request.PhoneNumber,
            request.CompanyPosition,
            cancellationToken);

        if (registerResult.IsError)
        {
            return registerResult.Errors;
        }

        var userId = registerResult.Value;

        // 2. Create Company for the User
        var companyResult = Company.Create(
            Guid.NewGuid(),
            userId,
            request.CompanyName,
            request.CityId,
            $"Bienvenue sur la fiche de {request.CompanyName}.", // Default description
            "N/A", // Address default
            null, // Lat
            null, // Lng
            request.SectorIds,
            request.Rccm,
            request.Niu);

        if (companyResult.IsError)
        {
            // Note: In a production app, we might want to rollback the user creation here
            // if we want strict atomicity across Identity and App DBs.
            return companyResult.Errors;
        }

        var company = companyResult.Value;
        if (!string.IsNullOrWhiteSpace(request.Website))
        {
            company.UpdateProfile(
                company.Name,
                company.Description,
                request.Website,
                company.CityId,
                company.Address ?? "N/A",
                company.Latitude,
                company.Longitude,
                request.SectorIds,
                company.Rccm,
                company.Niu,
                company.YearFounded);
        }

        context.Companies.Add(company);

        // 3. Auto-subscribe the new company to the Free plan.
        //    This removes the need for the user to manually select the Free plan
        //    after registration. The subscription is activated immediately since
        //    the Free plan requires no payment.
        var freePlan = await context.Plans
            .FirstOrDefaultAsync(p => p.Name == PlanName.Free && p.IsActive, cancellationToken);

        if (freePlan is not null)
        {
            var subscriptionResult = Subscription.Create(
                Guid.NewGuid(), company.Id, freePlan.Id, freePlan.DurationDays);

            if (!subscriptionResult.IsError)
            {
                var subscription = subscriptionResult.Value;

                var paymentResult = Payment.Create(
                    Guid.NewGuid(),
                    company.Id,
                    subscription.Id,
                    amount: 0m,
                    currency: "XAF",
                    method: PaymentMethod.Stripe, // placeholder — no real payment for free tier
                    GatewayRef: null,
                    InvoiceUrl: null,
                    paidAt: null);

                if (!paymentResult.IsError)
                {
                    // Activate immediately — free plan needs no payment confirmation
                    subscription.Activate();
                    company.SetActiveSubscription(subscription.Id);
                    paymentResult.Value.MarkAsSucceeded();

                    context.Subscriptions.Add(subscription);
                    context.Payments.Add(paymentResult.Value);
                }
                else
                {
                    logger.LogWarning(
                        "Could not create free-plan payment for company {CompanyId}: {Errors}",
                        company.Id, paymentResult.Errors);
                }
            }
            else
            {
                logger.LogWarning(
                    "Could not create free-plan subscription for company {CompanyId}: {Errors}",
                    company.Id, subscriptionResult.Errors);
            }
        }
        else
        {
            // Free plan not found in DB — log a warning but do not fail registration.
            // The user can manually select a plan from /espace/abonnement.
            logger.LogWarning(
                "Free plan not found or inactive during registration for company {CompanyId}. " +
                "Ensure the Free plan is seeded and active.", company.Id);
        }

        await context.SaveChangesAsync(cancellationToken);

        return userId;
    }
}
