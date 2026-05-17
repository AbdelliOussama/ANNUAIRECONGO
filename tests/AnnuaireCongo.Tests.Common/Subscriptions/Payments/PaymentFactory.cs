using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Subscriptions.Payments;
using ANNUAIRECONGO.Domain.Subscriptions.Payments.Enums;

namespace AnnuaireCongo.Tests.Common.Subscriptions.Payments;

public static class PaymentFactory
{
    public static Result<Payment> CreatePayment(
        Guid? id = null,
        Guid? companyId = null,
        Guid? subscriptionId = null,
        decimal? amount = null,
        string? currency = null,
        PaymentMethod? method = null,
        string? gatewayRef = null,
        string? invoiceUrl = null,
        DateTimeOffset? paidAt = null)
    {
        return Payment.Create(
            id ?? Guid.NewGuid(),
            companyId ?? Guid.NewGuid(),
            subscriptionId ?? Guid.NewGuid(),
            amount ?? 15000m,
            currency ?? "XAF",
            method ?? PaymentMethod.MTNMoMo,
            gatewayRef ?? null,
            invoiceUrl ?? null,
            paidAt ?? null
        );
    }

    /// <summary>
    /// Creates a payment that has already been marked as succeeded,
    /// simulating a completed transaction for integration tests.
    /// </summary>
    public static Result<Payment> CreateSucceededPayment(
        Guid? id = null,
        Guid? companyId = null,
        Guid? subscriptionId = null,
        decimal? amount = null)
    {
        var paymentResult = Payment.Create(
            id ?? Guid.NewGuid(),
            companyId ?? Guid.NewGuid(),
            subscriptionId ?? Guid.NewGuid(),
            amount ?? 15000m,
            "XAF",
            PaymentMethod.MTNMoMo,
            "MTN-GW-TEST-001",
            "https://storage.annuairetest.cg/invoices/test-invoice.pdf",
            DateTimeOffset.UtcNow
        );

        if (paymentResult.IsError) return paymentResult.Errors;

        paymentResult.Value.MarkAsSucceeded();
        return paymentResult.Value;
    }
}
