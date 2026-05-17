using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Subscriptions;

namespace AnnuaireCongo.Tests.Common.Subscriptions;

public static class SubscriptionFactory
{
    public static Result<Subscription> CreateSubscription(
        Guid? id = null,
        Guid? companyId = null,
        Guid? planId = null,
        int? durationDays = null)
    {
        return Subscription.Create(
            id ?? Guid.NewGuid(),
            companyId ?? Guid.NewGuid(),
            planId ?? Guid.NewGuid(),
            durationDays ?? 30
        );
    }
}
