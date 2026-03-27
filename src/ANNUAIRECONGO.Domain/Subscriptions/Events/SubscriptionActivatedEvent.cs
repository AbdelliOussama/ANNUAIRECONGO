
using ANNUAIRECONGO.Domain.Common;

namespace ANNUAIRECONGO.Domain.Subscriptions.Events;

public sealed record SubscriptionActivatedEvent(
    Guid SubscriptionId,
    Guid CompanyId,
    string OwnerId,
    string PlanName,
    DateTime ExpiresAt) : DomainEvent;
