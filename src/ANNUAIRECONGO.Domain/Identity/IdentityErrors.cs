using ANNUAIRECONGO.Domain.Common.Results;

namespace ANNUAIRECONGO.Domain.Identity;
public static class IdentityErrors
{
    public static readonly Error EmailAlreadyExists =
        Error.Conflict("Identity.EmailAlreadyExists", "A user with this email already exists.");
    
    public static readonly Error UserCreationFailed =
        Error.Failure("Identity.UserCreationFailed", "Failed to create user.");
    
    public static readonly Error InvalidCredentials =
        Error.Unauthorized("Identity.InvalidCredentials", "Invalid email or password.");

    public static readonly Error EmailNotConfirmed =
        Error.Conflict("Identity.EmailNotConfirmed", "Email address has not been confirmed.");

    public static readonly Error UserNotFound =
        Error.NotFound("Identity.UserNotFound", "User not found.");

    public static readonly Error InvalidToken =
        Error.Validation("Identity.InvalidToken", "The provided token is invalid or has expired.");

    public static readonly Error EmailConfirmationFailed =
        Error.Failure("Identity.EmailConfirmationFailed", "Failed to confirm email.");

    public static readonly Error PasswordChangeFailed =
        Error.Failure("Identity.PasswordChangeFailed", "Failed to change password.");

    public static readonly Error AccountDeletionFailed =
        Error.Failure("Identity.AccountDeletionFailed", "Failed to delete account.");
}
