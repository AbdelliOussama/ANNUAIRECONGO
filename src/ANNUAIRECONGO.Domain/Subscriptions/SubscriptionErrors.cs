
using ANNUAIRECONGO.Domain.Common.Results;

namespace ANNUAIRECONGO.Domain.Subscriptions;
public static class SubscriptionErrors
{
    public static Error OwnerIdRequired => Error.Validation(
        "Owner Id Required",
        $"Owner Id is required.");

    public static Error PlanIdRequired => Error.Validation(
        "Plan Id Required",
        $"Plan Id is required.");

    public static Error InvalidDuration => Error.Validation(
        "Invalid Duration",
        $"Duration must be a positive integer.");

    public static Error InvalidPlan(Guid planId) => Error.Validation(
        "Invalid Plan",
        $"Plan with id '{planId}' was not found.");

    public static readonly Error NotActive  = Error.Conflict(
        "Subscription.NotActive",
        "Subscription is not active.");



    public static  Error NotFound(Guid id) => Error.NotFound(
        "Subscription.NotFound",
        $"Subscription with id '{id}' was not found.");

    public static readonly Error NotPending = Error.Conflict(
        "Subscription.NotPending",
        "Subscription must be in Pending status to be activated.");

    public static readonly Error CannotCancel = Error.Conflict(
        "Subscription.CannotCancel",
        "Subscription is already expired or cancelled.");

    public static readonly Error AlreadyActive = Error.Conflict(
        "Subscription.AlreadyActive",
        "This company already has an active subscription.");
}
