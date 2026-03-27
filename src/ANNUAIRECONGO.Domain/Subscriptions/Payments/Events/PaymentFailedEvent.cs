
using ANNUAIRECONGO.Domain.Common;

namespace ANNUAIRECONGO.Domain.Subscriptions.Payments.Events;

public sealed record PaymentFailedEvent(
    Guid PaymentId,
    Guid CompanyId,
    string OwnerId,
    string Reason) : DomainEvent;
