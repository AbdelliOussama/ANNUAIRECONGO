using ANNUAIRECONGO.Application.Features.Subscriptions.Payments.Dtos;
using ANNUAIRECONGO.Domain.Subscriptions.Payments;

namespace ANNUAIRECONGO.Application.Features.Subscriptions.Payments.Mappers;

public static class PaymentMapper
{
    public static PaymentDto ToDto(this Payment payment)
    {
        return new PaymentDto(
            payment.Id,
            payment.CompanyId,
            payment.SubscriptionId,
            payment.Amount,
            payment.Currency,
            payment.Method,
            payment.Status,
            payment.GatewayRef,
            payment.InvoiceUrl,
            payment.PaidAt
        );
    }
    public static List<PaymentDto> ToDtos(this IEnumerable<Payment> payments)
    {
        return [..payments.Select(p => ToDto(p))];
    }
}