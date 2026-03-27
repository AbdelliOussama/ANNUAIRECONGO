
using ANNUAIRECONGO.Domain.Common;

namespace ANNUAIRECONGO.Domain.Subscriptions.Events;

public sealed record SubscriptionCancelledEvent(
    Guid SubscriptionId,
    Guid CompanyId,
    string OwnerId) : DomainEvent;
