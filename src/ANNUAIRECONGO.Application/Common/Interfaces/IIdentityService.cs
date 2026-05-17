using ANNUAIRECONGO.Application.Features.Identity.Dtos;
using ANNUAIRECONGO.Domain.Common.Results;

namespace ANNUAIRECONGO.Application.Common.Interfaces;

public interface IIdentityService
{
    Task<bool> IsInRoleAsync(string userId, string role);

    Task<bool> AuthorizeAsync(string userId, string? policyName);

    Task<Result<AppUserDto>> AuthenticateAsync(string email, string password);

    Task<Result<AppUserDto>> GetUserByIdAsync(string userId);

    Task<string?> GetUserNameAsync(string userId);

    Task<Result<Guid>> RegisterAsync(
        string email,
        string password,
        string firstName,
        string lastName,
        string phoneNumber,
        string? companyPosition,
        CancellationToken cancellationToken);

    Task<Result<Success>> ForgotPasswordAsync(string email, CancellationToken cancellationToken);

    Task<Result<Success>> ResetPasswordAsync(string email, string token, string newPassword, CancellationToken cancellationToken);

    /* ─── Audit fixes (May 2026 deep audit) ──────────────────────────── */

    /// <summary>Confirms a user's email using the token issued at registration.</summary>
    Task<Result<Success>> VerifyEmailAsync(string email, string token, CancellationToken cancellationToken);

    /// <summary>Sends a fresh email-confirmation link. No-op (returns Success) if the email is unknown — prevents enumeration.</summary>
    Task<Result<Success>> ResendVerificationEmailAsync(string email, CancellationToken cancellationToken);

    /// <summary>Changes the password of the currently authenticated user.</summary>
    Task<Result<Success>> ChangePasswordAsync(string userId, string currentPassword, string newPassword, CancellationToken cancellationToken);

    /// <summary>Permanently deletes the user account + linked BusinessOwner row. Companies are detached (OwnerId set to null).</summary>
    Task<Result<Success>> DeleteAccountAsync(string userId, CancellationToken cancellationToken);

    /// <summary>Updates the personal and professional info of the user.</summary>
    Task<Result<Success>> UpdateProfileAsync(string userId, string firstName, string lastName, string phoneNumber, string? companyPosition, CancellationToken cancellationToken);

    /// <summary>Retrieves all users with their roles and basic profile info.</summary>
    Task<Result<List<AppUserDto>>> GetAllUsersAsync(CancellationToken cancellationToken = default);
}
