using ANNUAIRECONGO.Domain.Subscriptions.Enums;
using ANNUAIRECONGO.Domain.Subscriptions.Payments.Enums;

namespace ANNUAIRECONGO.Application.Features.Subscriptions.Dtos;

public sealed record SubscriptionWithPaymentDto
{
    public Guid SubscriptionId { get; set; }
    public SubscriptionStatus Status { get; set; }

    // Payment details
    public Guid PaymentId { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = null!;
    public PaymentMethod Method { get; set; }
    public DateTime? PaymentDate { get; set; }
}