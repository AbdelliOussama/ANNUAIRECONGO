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
}