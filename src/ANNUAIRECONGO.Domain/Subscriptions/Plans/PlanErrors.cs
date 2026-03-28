
using ANNUAIRECONGO.Domain.Common.Results;

namespace ANNUAIRECONGO.Domain.Subscriptions.Plans;

public static class PlanErrors
{
    public static Error NotFound(Guid id) => Error.NotFound(
        "Plan.NotFound",
        $"Plan with id '{id}' was not found.");

    public static readonly Error Inactive = Error.Conflict(
        "Plan.Inactive",
        "This plan is no longer available.");

    public static readonly Error FreeCannotBePurchased = Error.Validation(
        "Plan.FreeCannotBePurchased",
        "The Free plan does not require payment.");

    public static readonly Error InvalidPrice = Error.Validation(
        "Plan.InvalidPrice",
        "Price must be a non-negative value.");

    public static readonly Error InvalidDuration = Error.Validation(
        "Plan.InvalidDuration",
        "Duration must be greater than zero.");

    public static readonly Error InvalidSearchPriority = Error.Validation(
        "Plan.InvalidSearchPriority",
        "Search priority must be between 1 and 3.");

    public static readonly Error AlreadyInactive = Error.Conflict(
        "Plan.AlreadyInactive",
        "This plan is already inactive.");

    public static readonly Error AlreadyActive = Error.Conflict(
        "Plan.AlreadyActive",
        "This plan is already active.");

    public static readonly Error NoPlansFound = Error.NotFound(
        "Plan.NoPlansFound",
        "No plans were found in the database.");
}
