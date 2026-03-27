
using ANNUAIRECONGO.Domain.Common;

namespace ANNUAIRECONGO.Domain.Subscriptions.Events;

public sealed record SubscriptionExpiringSoonEvent(
    Guid SubscriptionId,
    Guid CompanyId,
    string OwnerId,
    DateTime ExpiresAt) : DomainEvent;
