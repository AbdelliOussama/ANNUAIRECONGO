using ANNUAIRECONGO.Domain.Subscriptions.Plans.Enums;
using ANNUAIRECONGO.Domain.Subscriptions.Payments.Enums;

namespace ANNUAIRECONGO.Application.Features.Subscriptions.Payments.Dtos;

/// <summary>
/// Payment read model. Field names align with the FE Payment interface so
/// the JSON contract is 1:1 with the espace historique table.
///
/// Audit fix #1 (May 2026 deep audit):
///   - Reference: human-readable invoice number (F-YYYY-XXXXXX) surfaced
///     in the historique "Reference" column.
///   - PlanName: convenience join from the related Plan via Subscription so
///     the historique "Forfait" column does not need a second round-trip
///     to /api/v1/plans.
/// </summary>
public sealed record PaymentDto(
    Guid            Id,
    Guid            CompanyId,
    string?         CompanyName,
    Guid            SubscriptionId,
    string        Reference,
    PlanName?       PlanName,
    decimal         Amount,
    string          Currency,
    PaymentMethod   Method,
    PaymentStatus   Status,
    string?         GatewayRef,
    string?         InvoiceUrl,
    DateTimeOffset? PaidAt);
