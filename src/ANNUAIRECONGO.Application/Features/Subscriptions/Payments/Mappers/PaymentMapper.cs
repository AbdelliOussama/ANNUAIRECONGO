using ANNUAIRECONGO.Application.Features.Subscriptions.Payments.Dtos;
using ANNUAIRECONGO.Domain.Subscriptions.Payments;

namespace ANNUAIRECONGO.Application.Features.Subscriptions.Payments.Mappers;

public static class PaymentMapper
{
    /// <summary>
    /// Maps a Payment to its FE-facing DTO.
    /// <see cref="PaymentDto.PlanName"/> is filled when the caller has
    /// .Include()d Subscription→Plan; otherwise it stays null.
    /// </summary>
    public static PaymentDto ToDto(this Payment payment)
    {
        return new PaymentDto(
            payment.Id,
            payment.CompanyId,
            payment.Company?.Name,
            payment.SubscriptionId,
            payment.Reference,
            payment.Subscription?.Plan?.Name,
            payment.Amount,
            payment.Currency,
            payment.Method,
            payment.Status,
            payment.GatewayRef,
            payment.InvoiceUrl,
            payment.PaidAt
        );
    }
    public static List<PaymentDto> ToDtoList(this IEnumerable<Payment> payments)
    {
        return [..payments.Select(p => ToDto(p))];
    }
}
