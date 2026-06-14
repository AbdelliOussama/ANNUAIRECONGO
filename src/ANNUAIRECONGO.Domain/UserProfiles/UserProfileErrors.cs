using ANNUAIRECONGO.Domain.Common.Results;

namespace ANNUAIRECONGO.Domain.UserProfiles;

public static class UserProfileErrors
{
    public static Error IdRequired        => Error.Validation("UserProfile.IdRequired",        "L'identifiant du profil est requis.");
    public static Error FirstNameRequired => Error.Validation("UserProfile.FirstNameRequired", "Le prénom est requis.");
    public static Error LastNameRequired  => Error.Validation("UserProfile.LastNameRequired",  "Le nom est requis.");
    public static Error EmailRequired     => Error.Validation("UserProfile.EmailRequired",     "L'adresse e-mail est requise.");

    public static Error NotFound(Guid id) =>
        Error.NotFound("UserProfile.NotFound", $"Le profil utilisateur {id} est introuvable.");
}
