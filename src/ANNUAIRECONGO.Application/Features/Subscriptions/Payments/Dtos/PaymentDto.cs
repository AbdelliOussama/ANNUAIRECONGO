using ANNUAIRECONGO.Domain.Subscriptions.Payments.Enums;

namespace ANNUAIRECONGO.Application.Features.Subscriptions.Payments.Dtos;

public sealed record PaymentDto(
    Guid Id,
    Guid CompanyId,
    Guid SubscriptionId,
    decimal Amount,
    string Currency,
    PaymentMethod Method,
    PaymentStatus Status,
    string? GatewayRef,
    string? InvoiceUrl,
    DateTime? PaidAt);