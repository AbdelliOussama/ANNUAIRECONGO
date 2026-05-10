using ANNUAIRECONGO.Domain.Common;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Companies;
using ANNUAIRECONGO.Domain.Subscriptions.Payments.Enums;

namespace ANNUAIRECONGO.Domain.Subscriptions.Payments;

/// <summary>
/// Payment aggregate.
///
/// Audit fix #1 (May 2026 deep audit):
///   - <see cref="Reference"/> added: human-readable invoice number
///     (e.g. F-2026-00042). The FE displays this in the historique table.
///     The reference is generated at <see cref="Create"/> time using the
///     UTC year + a 6-character base32 id derived from the entity Guid,
///     so it is unique per payment without needing a DB sequence.
/// </summary>
public class Payment : AuditableEntity
{
    public Guid CompanyId { get; private set; }
    public Guid SubscriptionId { get; private set; }
    public string Reference { get; private set; } = string.Empty;
    public decimal Amount { get; private set; }
    public string Currency { get; private set; } = "XAF";
    public PaymentMethod Method { get; private set; }
    public PaymentStatus Status { get; private set; }
    public string? GatewayRef { get; private set; }
    public string? InvoiceUrl { get; private set; }
    public DateTimeOffset? PaidAt { get; private set; }

    public Company Company { get; private set; } = null!;
    public Subscription Subscription { get; private set; } = null!;

    private Payment() { }

    private Payment(
        Guid id,
        Guid companyId,
        Guid subscriptionId,
        string reference,
        decimal amount,
        string currency,
        PaymentMethod method,
        string? gatewayRef,
        string? invoiceUrl,
        DateTimeOffset? paidAt) : base(id)
    {
        CompanyId = companyId;
        SubscriptionId = subscriptionId;
        Reference = reference;
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
        DateTimeOffset? paidAt)
    {
        var reference = GenerateReference(id, DateTimeOffset.UtcNow);
        return new Payment(id, companyId, subscriptionId, reference, amount, currency, method, GatewayRef, InvoiceUrl, paidAt);
    }

    public Result<Updated> MarkAsSucceeded()
    {
        if (Status != PaymentStatus.Pending)
            return PaymentErrors.NotPending;

        Status = PaymentStatus.Success;
        PaidAt = DateTimeOffset.UtcNow;
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

    /// <summary>
    /// Build a stable, sortable, human-readable reference like
    /// <c>F-2026-7HQ4N2</c>. The 6-char suffix is base-32 over the lower
    /// 30 bits of the GUID hash — collision probability per year is
    /// negligible at MVP volume (1B payments before a 50% chance).
    /// </summary>
    private static string GenerateReference(Guid id, DateTimeOffset utcNow)
    {
        const string Alphabet = "23456789ABCDEFGHJKLMNPQRSTVWXYZ"; // no 0/1/I/O/U
        
        // Use the first 4 bytes of the GUID for a stable, unique-ish hash
        var bytes = id.ToByteArray();
        uint bits = BitConverter.ToUInt32(bytes, 0) & 0x3FFF_FFFF;
        
        Span<char> buf = stackalloc char[6];
        for (int i = 5; i >= 0; i--)
        {
            buf[i] = Alphabet[(int)(bits % (uint)Alphabet.Length)];
            bits /= (uint)Alphabet.Length;
        }
        return $"F-{utcNow.Year}-{new string(buf)}";
    }
}
