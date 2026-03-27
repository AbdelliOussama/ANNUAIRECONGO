
using ANNUAIRECONGO.Domain.Common;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Companies;
using ANNUAIRECONGO.Domain.Subscriptions;
using ANNUAIRECONGO.Domain.Subscriptions.Payments;
using ANNUAIRECONGO.Domain.Subscriptions.Payments.Enums;

namespace AnnuaireCongo.Domain.Payments;

public class Payment : AuditableEntity
{
    public Guid CompanyId { get; private set; }
    public Guid SubscriptionId { get; private set; }
    public decimal Amount { get; private set; }
    public string Currency { get; private set; } = "XAF";
    public PaymentMethod Method { get; private set; }
    public PaymentStatus Status { get; private set; }
    public string? GatewayRef { get; private set; }
    public string? InvoiceUrl { get; private set; }
    public DateTime? PaidAt { get; private set; }

    public Company Company { get; private set; } = null!;
    public Subscription Subscription { get; private set; } = null!;

    private Payment() { }

    public static Result<Payment> Create(
        Guid companyId,
        Guid subscriptionId,
        decimal amount,
        string currency,
        PaymentMethod method)
    {
        return new Payment
        {
            CompanyId = companyId,
            SubscriptionId = subscriptionId,
            Amount = amount,
            Currency = currency,
            Method = method,
            Status = PaymentStatus.Pending
        };
    }

    public Result<Updated> MarkAsSucceeded(string ownerId, string gatewayRef)
    {
        if (Status != PaymentStatus.Pending)
            return PaymentErrors.NotPending;

        Status = PaymentStatus.Success;
        GatewayRef = gatewayRef;
        PaidAt = DateTime.UtcNow;

        // RaiseDomainEvent(new PaymentSucceededEvent(
        //     Id, CompanyId, SubscriptionId, ownerId, Amount, Currency));

        return Result.Updated;
    }

    public Result<Updated> MarkAsFailed(string ownerId, string reason)
    {
        if (Status != PaymentStatus.Pending)
            return PaymentErrors.NotPending;

        Status = PaymentStatus.Failed;
        // RaiseDomainEvent(new PaymentFailedEvent(
        //     Id, CompanyId, ownerId, reason));
        return Result.Updated;
    }

    public Result<Success> Refund(string ownerId)
    {
        if (Status != PaymentStatus.Success)
            return PaymentErrors.CannotRefund;
        Status = PaymentStatus.Refunded;
        // RaiseDomainEvent(new PaymentRefundedEvent(
        //     Id, CompanyId, ownerId, Amount));
        return Result.Success;
    }

    public Result<Updated> SetInvoiceUrl(string invoiceUrl)
    {
        InvoiceUrl = invoiceUrl;
        return Result.Updated;
    }
}
