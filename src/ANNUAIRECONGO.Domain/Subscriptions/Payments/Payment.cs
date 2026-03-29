
using ANNUAIRECONGO.Domain.Common;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Companies;
using ANNUAIRECONGO.Domain.Subscriptions.Payments.Enums;

namespace ANNUAIRECONGO.Domain.Subscriptions.Payments;

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

    private Payment(Guid id,Guid companyId,Guid subscriptionId,decimal amount,string currency,PaymentMethod method,string? gatewayRef,string? invoiceUrl,DateTime? paidAt) : base(id)
    {
        CompanyId = companyId;
        SubscriptionId = subscriptionId;
        Amount = amount;
        Currency = currency;
        Method = method;
        GatewayRef = gatewayRef;
        InvoiceUrl = invoiceUrl;
        PaidAt = paidAt;
        Status = PaymentStatus.Pending;
    }

    public static Result<Payment> Create(
        Guid id,
        Guid companyId,
        Guid subscriptionId,
        decimal amount,
        string currency,
        PaymentMethod method,
        string? GatewayRef,
        string? InvoiceUrl,
        DateTime? paidAt)
    {
        return new Payment(id,companyId,subscriptionId,amount,currency,method,GatewayRef,InvoiceUrl,paidAt);
    }

    public Result<Updated> MarkAsSucceeded()
    {
        if (Status != PaymentStatus.Pending)
            return PaymentErrors.NotPending;

        Status = PaymentStatus.Success;
        PaidAt = DateTime.UtcNow;
        return Result.Updated;
    }

    public Result<Updated> MarkAsFailed()
    {
        if (Status != PaymentStatus.Pending)
            return PaymentErrors.NotPending;

        Status = PaymentStatus.Failed;
        return Result.Updated;
    }
    public Result<Updated> Refund()
    {
        if (Status != PaymentStatus.Success)
            return PaymentErrors.CannotRefund;
        Status = PaymentStatus.Refunded;
        return Result.Updated;
    }

    public Result<Updated> SetInvoiceUrl(string invoiceUrl)
    {
        InvoiceUrl = invoiceUrl;
        return Result.Updated;
    }
}
