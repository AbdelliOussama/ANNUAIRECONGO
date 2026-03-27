
using ANNUAIRECONGO.Domain.Common;

namespace ANNUAIRECONGO.Domain.Subscriptions.Events;

public sealed record SubscriptionExpiredEvent(
    Guid SubscriptionId,
    Guid CompanyId,
    string OwnerId) : DomainEvent;
