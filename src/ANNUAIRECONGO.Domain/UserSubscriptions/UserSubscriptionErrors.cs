using ANNUAIRECONGO.Domain.Common.Results;

namespace ANNUAIRECONGO.Domain.UserSubscriptions;

public static class UserSubscriptionErrors
{
    public static Error UserIdRequired   => Error.Validation("UserSubscription.UserIdRequired",   "L'identifiant de l'utilisateur est requis.");
    public static Error PlanIdRequired   => Error.Validation("UserSubscription.PlanIdRequired",   "L'identifiant du forfait est requis.");
    public static Error InvalidDuration  => Error.Validation("UserSubscription.InvalidDuration",  "La durée de l'abonnement doit être supérieure à 0.");
    public static Error NotPending       => Error.Conflict  ("UserSubscription.NotPending",       "L'abonnement doit être en attente pour être activé.");
    public static Error NotActive        => Error.Conflict  ("UserSubscription.NotActive",        "L'abonnement doit être actif pour cette opération.");
    public static Error CannotCancel     => Error.Conflict  ("UserSubscription.CannotCancel",     "L'abonnement ne peut pas être annulé dans son état actuel.");

    public static Error NotFound(Guid id) =>
        Error.NotFound("UserSubscription.NotFound", $"L'abonnement utilisateur {id} est introuvable.");
}
