using AnnuaireCongo.Tests.Common.Subscriptions.Payments;
using ANNUAIRECONGO.Application.Features.Subscriptions.Payments.Mappers;
using Xunit;

namespace AnnuaireCongo.Application.UnitTests.Mappers;

public class PaymentMapperTests
{
    [Fact]
    public void Payment_ToDto_ShouldMapPropertiesCorrectly()
    {
        // Arrange
        var payment = PaymentFactory.CreatePayment().Value;

        // Act
        var dto = payment.ToDto();

        // Assert
        Assert.NotNull(dto);
        Assert.Equal(payment.Id, dto.Id);
        Assert.Equal(payment.CompanyId, dto.CompanyId);
        Assert.Equal(payment.SubscriptionId, dto.SubscriptionId);
        Assert.Equal(payment.Reference, dto.Reference);
        Assert.Equal(payment.Amount, dto.Amount);
        Assert.Equal(payment.Currency, dto.Currency);
        Assert.Equal(payment.Method, dto.Method);
        Assert.Equal(payment.Status, dto.Status);
        Assert.Equal(payment.GatewayRef, dto.GatewayRef);
        Assert.Equal(payment.InvoiceUrl, dto.InvoiceUrl);
        Assert.Equal(payment.PaidAt, dto.PaidAt);
    }

    [Fact]
    public void PaymentList_ToDtoList_ShouldMapAllItems()
    {
        // Arrange
        var payments = new[] { PaymentFactory.CreatePayment().Value, PaymentFactory.CreatePayment().Value };

        // Act
        var dtos = payments.ToDtoList();

        // Assert
        Assert.NotNull(dtos);
        Assert.Equal(2, dtos.Count);
    }
}
