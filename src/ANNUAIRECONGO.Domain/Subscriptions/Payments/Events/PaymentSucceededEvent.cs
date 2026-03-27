
using ANNUAIRECONGO.Domain.Common;

namespace ANNUAIRECONGO.Domain.Subscriptions.Payments.Events;

public sealed record PaymentSucceededEvent(
    Guid PaymentId,
    Guid CompanyId,
    Guid SubscriptionId,
    string OwnerId,
    decimal Amount,
    string Currency) : DomainEvent;
