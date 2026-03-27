
using ANNUAIRECONGO.Domain.Common;

namespace ANNUAIRECONGO.Domain.Subscriptions.Payments.Events;

public sealed record PaymentRefundedEvent(
    Guid PaymentId,
    Guid CompanyId,
    string OwnerId,
    decimal Amount) : DomainEvent;
