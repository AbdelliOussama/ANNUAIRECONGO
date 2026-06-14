using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Domain.BusinessOwners;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Companies;
using ANNUAIRECONGO.Domain.Identity;
using ANNUAIRECONGO.Domain.Subscriptions;
using ANNUAIRECONGO.Domain.Subscriptions.Payments;
using ANNUAIRECONGO.Domain.Subscriptions.Payments.Enums;
using ANNUAIRECONGO.Domain.Subscriptions.Plans.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Identity.Commands.CreateCompanyForOwner;

/// <summary>
/// Creates a <see cref="BusinessOwner"/> contact record (no AppUser) and a
/// <see cref="Company"/> on behalf of a passive business owner who has no
/// system account. All entities are committed in a single <c>SaveChangesAsync</c>.
/// </summary>
public sealed class CreateCompanyForOwnerCommandHandler(
    IAppDbContext context,
    ILogger<CreateCompanyForOwnerCommandHandler> logger)
    : IRequestHandler<CreateCompanyForOwnerCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(
        CreateCompanyForOwnerCommand request,
        CancellationToken cancellationToken)
    {
        // ── Step 1: Create BusinessOwner contact record (no AppUser) ─────────
        // A fresh Guid is used — it is NOT linked to any Identity user because
        // BusinessOwnerConfigurations has no FK from BusinessOwner.Id to AspNetUsers.Id.
        // Role.EntrepriseOwner is semantically correct; EF ignores the Role field (builder.Ignore).
        var ownerId = Guid.NewGuid();

        var ownerResult = BusinessOwner.Create(
            ownerId,
            request.OwnerFirstName,
            request.OwnerLastName,
            request.OwnerEmail,
            request.OwnerPhone,
            request.OwnerPosition,
            Role.EntrepriseOwner);

        if (ownerResult.IsError)
            return ownerResult.Errors;

        // ── Step 2: Create Company and immediately activate it ───────────────
        // Admin-created companies skip the Draft/Pending pipeline entirely —
        // the admin IS the acting owner, so no external validation is needed.
        var companyResult = Company.Create(
            Guid.NewGuid(),
            ownerId,
            request.CompanyName,
            request.CityId,
            $"Bienvenue sur la fiche de {request.CompanyName}.",
            "N/A",
            null,
            null,
            request.SectorIds,
            request.Rccm,
            request.Niu);

        if (companyResult.IsError)
            return companyResult.Errors;

        var company = companyResult.Value;

        // Activate immediately: Draft → Pending → Active in one go.
        // No need to go through the SubmitCompany / ValidateCompany command pipeline.
        company.Submit();   // Draft → Pending
        company.Validate(); // Pending → Active

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

        // ── Step 3: Auto-subscribe to Free plan ──────────────────────────────
        // Same logic as RegisterCommandHandler — Free plan activates immediately,
        // gives the company a valid subscription even while still at Draft status.
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
                    subscription.Activate();
                    company.SetActiveSubscription(subscription.Id);
                    paymentResult.Value.MarkAsSucceeded();

                    context.Subscriptions.Add(subscription);
                    context.Payments.Add(paymentResult.Value);
                }
                else
                {
                    logger.LogWarning(
                        "Could not create free-plan payment for admin-managed company {CompanyId}: {Errors}",
                        company.Id, paymentResult.Errors);
                }
            }
            else
            {
                logger.LogWarning(
                    "Could not create free-plan subscription for admin-managed company {CompanyId}: {Errors}",
                    company.Id, subscriptionResult.Errors);
            }
        }
        else
        {
            logger.LogWarning(
                "Free plan not found or inactive during admin-managed company creation {CompanyId}. " +
                "Ensure the Free plan is seeded and active.", company.Id);
        }

        // ── Step 4: Stage all entities ────────────────────────────────────────
        context.BusinessOwners.Add(ownerResult.Value);
        context.Companies.Add(company);

        // ── Step 5: Single atomic commit ──────────────────────────────────────
        try
        {
            await context.SaveChangesAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogError(ex,
                "Failed to persist admin-managed company for owner {OwnerEmail}.",
                request.OwnerEmail);
            return IdentityErrors.UserCreationFailed;
        }

        // Return the Company Guid so the frontend can navigate directly to it.
        return company.Id;
    }
}
