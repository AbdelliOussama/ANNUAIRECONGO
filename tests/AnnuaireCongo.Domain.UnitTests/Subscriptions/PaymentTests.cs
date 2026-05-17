using AnnuaireCongo.Tests.Common.Subscriptions.Payments;
using ANNUAIRECONGO.Domain.Subscriptions.Payments.Enums;
using Xunit;

namespace AnnuaireCongo.Domain.UnitTests.Subscriptions;

public class PaymentTests
{
    // ── Create ────────────────────────────────────────────────────────────────

    [Fact]
    public void Create_WithValidData_ShouldBeInPendingState()
    {
        var result = PaymentFactory.CreatePayment();

        Assert.False(result.IsError);
        Assert.Equal(PaymentStatus.Pending, result.Value.Status);
        Assert.Equal(15000m, result.Value.Amount);
        Assert.Equal("XAF", result.Value.Currency);
        Assert.Equal(PaymentMethod.MTNMoMo, result.Value.Method);
    }

    [Fact]
    public void Create_ShouldGenerateANonEmptyReference()
    {
        var result = PaymentFactory.CreatePayment();

        Assert.False(result.IsError);
        Assert.False(string.IsNullOrWhiteSpace(result.Value.Reference));
        Assert.StartsWith("F-", result.Value.Reference);
    }

    [Fact]
    public void Create_TwoPayments_ShouldHaveUniqueReferences()
    {
        var p1 = PaymentFactory.CreatePayment().Value;
        var p2 = PaymentFactory.CreatePayment().Value;

        Assert.NotEqual(p1.Reference, p2.Reference);
    }

    // ── MarkAsSucceeded ───────────────────────────────────────────────────────

    [Fact]
    public void MarkAsSucceeded_WhenPending_ShouldTransitionToSuccess()
    {
        var payment = PaymentFactory.CreatePayment().Value;

        var result = payment.MarkAsSucceeded();

        Assert.False(result.IsError);
        Assert.Equal(PaymentStatus.Success, payment.Status);
        Assert.NotNull(payment.PaidAt);
    }

    [Fact]
    public void MarkAsSucceeded_WhenAlreadySucceeded_ShouldReturnError()
    {
        var payment = PaymentFactory.CreatePayment().Value;
        payment.MarkAsSucceeded();

        var result = payment.MarkAsSucceeded();

        Assert.True(result.IsError);
    }

    // ── MarkAsFailed ──────────────────────────────────────────────────────────

    [Fact]
    public void MarkAsFailed_WhenPending_ShouldTransitionToFailed()
    {
        var payment = PaymentFactory.CreatePayment().Value;

        var result = payment.MarkAsFailed();

        Assert.False(result.IsError);
        Assert.Equal(PaymentStatus.Failed, payment.Status);
    }

    [Fact]
    public void MarkAsFailed_WhenAlreadyFailed_ShouldReturnError()
    {
        var payment = PaymentFactory.CreatePayment().Value;
        payment.MarkAsFailed();

        var result = payment.MarkAsFailed();

        Assert.True(result.IsError);
    }

    // ── Refund ────────────────────────────────────────────────────────────────

    [Fact]
    public void Refund_WhenSucceeded_ShouldTransitionToRefunded()
    {
        var payment = PaymentFactory.CreatePayment().Value;
        payment.MarkAsSucceeded();

        var result = payment.Refund();

        Assert.False(result.IsError);
        Assert.Equal(PaymentStatus.Refunded, payment.Status);
    }

    [Fact]
    public void Refund_WhenPending_ShouldReturnError()
    {
        var payment = PaymentFactory.CreatePayment().Value;

        var result = payment.Refund();

        Assert.True(result.IsError);
    }

    [Fact]
    public void Refund_WhenFailed_ShouldReturnError()
    {
        var payment = PaymentFactory.CreatePayment().Value;
        payment.MarkAsFailed();

        var result = payment.Refund();

        Assert.True(result.IsError);
    }

    // ── SetInvoiceUrl ─────────────────────────────────────────────────────────

    [Fact]
    public void SetInvoiceUrl_ShouldUpdateUrl()
    {
        var payment = PaymentFactory.CreatePayment().Value;
        const string url = "https://storage.test.cg/invoices/F-2026-TEST01.pdf";

        var result = payment.SetInvoiceUrl(url);

        Assert.False(result.IsError);
        Assert.Equal(url, payment.InvoiceUrl);
    }

    // ── CreateSucceededPayment helper ─────────────────────────────────────────

    [Fact]
    public void CreateSucceededPayment_ShouldAlreadyBeInSuccessState()
    {
        var result = PaymentFactory.CreateSucceededPayment();

        Assert.False(result.IsError);
        Assert.Equal(PaymentStatus.Success, result.Value.Status);
        Assert.NotNull(result.Value.PaidAt);
    }
}
