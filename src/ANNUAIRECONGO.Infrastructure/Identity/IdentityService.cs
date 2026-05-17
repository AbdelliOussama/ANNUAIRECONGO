using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Features.Identity.Dtos;
using ANNUAIRECONGO.Domain.BusinessOwners;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.EntityFrameworkCore;
using System.Net;

namespace ANNUAIRECONGO.Infrastructure.Identity;

public class IdentityService : IIdentityService
{
    #region  Fields
        private readonly UserManager<AppUser> _userManager;
        private readonly IUserClaimsPrincipalFactory<AppUser> _claimsPrincipalFactory;
        private readonly IAuthorizationService _authorizationService;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly IAppDbContext _context;
    #endregion

    #region  Constructors
    private readonly IConfiguration _configuration;
    private readonly INotificationService _notificationService;

    public IdentityService(UserManager<AppUser> userManager, IUserClaimsPrincipalFactory<AppUser> claimsPrincipalFactory, IAuthorizationService authorizationService,RoleManager<IdentityRole> roleManager,IAppDbContext context, IConfiguration configuration, INotificationService notificationService)
    {
        _userManager = userManager;
        _claimsPrincipalFactory = claimsPrincipalFactory;
        _authorizationService = authorizationService;
        _roleManager = roleManager;
        _context = context;
        _configuration = configuration;
        _notificationService = notificationService;
    }
    #endregion

    public async Task<Result<AppUserDto>> AuthenticateAsync(string email, string password)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if(user is null || !await _userManager.CheckPasswordAsync(user, password))
        {
            return IdentityErrors.InvalidCredentials;
        }

        var bo = await _context.BusinessOwners.FirstOrDefaultAsync(b => b.Id == Guid.Parse(user.Id));

        return new AppUserDto(
            user.Id,
            user.Email!,
            await _userManager.GetRolesAsync(user),
            bo?.FirstName,
            bo?.LastName,
            bo?.Phone,
            bo?.CompanyPosition
        );
    }

    public async Task<bool> AuthorizeAsync(string userId, string? policyName)
    {
        var user =await _userManager.FindByIdAsync(userId);
        if(user is null)
        {
            return false;
        }
        var principal = await _claimsPrincipalFactory.CreateAsync(user);
        var result =await _authorizationService.AuthorizeAsync(principal, policyName);
        return result.Succeeded ;


    }

    public async Task<Result<AppUserDto>> GetUserByIdAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if(user is null)
        {
            return IdentityErrors.UserNotFound;
        }

        var bo = await _context.BusinessOwners.FirstOrDefaultAsync(b => b.Id == Guid.Parse(user.Id));

        return new AppUserDto(
            user.Id,
            user.Email!,
            await _userManager.GetRolesAsync(user),
            bo?.FirstName,
            bo?.LastName,
            bo?.Phone,
            bo?.CompanyPosition
        );
    }

    public async Task<string?> GetUserNameAsync(string userId)
    {
        var user =await _userManager.FindByIdAsync(userId);
        if(user is null)
        {
            return null;
        }
        return user.UserName;
    }

    public async Task<bool> IsInRoleAsync(string userId, string role)
    {
        var user =await _userManager.FindByIdAsync(userId);
        return user !=null && await _userManager.IsInRoleAsync(user,role);

    }

    public async Task<Result<Guid>> RegisterAsync(
        string email,
        string password,
        string firstName,
        string lastName,
        string phoneNumber,
        string? companyPosition,
        CancellationToken cancellationToken)
    {
        var existingUser = await _userManager.FindByEmailAsync(email);
        if (existingUser != null)
        {
            return IdentityErrors.EmailAlreadyExists;
        }

        var appUser = new AppUser
        {
            Id = Guid.NewGuid().ToString(),
            Email = email,
            UserName = email,
            EmailConfirmed = false
        };

        var createResult = await _userManager.CreateAsync(appUser, password);
        if (!createResult.Succeeded)
        {
            return IdentityErrors.UserCreationFailed;
        }

        // Send verification email
        await ResendVerificationEmailAsync(email, cancellationToken);

        var businessOwnerRole = await _roleManager.FindByNameAsync(nameof(Role.EntrepriseOwner));
        if (businessOwnerRole == null)
        {
            businessOwnerRole = new IdentityRole(nameof(Role.EntrepriseOwner));
            await _roleManager.CreateAsync(businessOwnerRole);
        }

        await _userManager.AddToRoleAsync(appUser, businessOwnerRole.Name);

        var businessOwnerResult = BusinessOwner.Create(
            Guid.Parse(appUser.Id),
            firstName,
            lastName,
            email,
            phoneNumber,
            companyPosition,
            Role.EntrepriseOwner);

        if (businessOwnerResult.IsError)
        {
            await _userManager.DeleteAsync(appUser);
            return businessOwnerResult.Errors;
        }

        try
        {
            _context.BusinessOwners.Add(businessOwnerResult.Value);
            await _context.SaveChangesAsync(cancellationToken);
        }
        catch
        {
            await _userManager.DeleteAsync(appUser);
            return IdentityErrors.UserCreationFailed;
        }

        return businessOwnerResult.Value.Id;
    }

    public async Task<Result<Success>> ForgotPasswordAsync(string email, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user is null)
        {
            // Return success anyway to prevent user enumeration
            return Result.Success;
        }

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        var encodedToken = WebUtility.UrlEncode(token);

        var resetUrl = _configuration["AppSettings:ClientAppUrl"];
        if (string.IsNullOrEmpty(resetUrl))
        {
            resetUrl = "http://localhost:4200";
        }

        var resetLink = $"{resetUrl}/reset-password?email={WebUtility.UrlEncode(email)}&token={encodedToken}";

        var subject = "Reset your password";
        var body = $"Please reset your password by clicking <a href='{resetLink}'>here</a>.";

        await _notificationService.SendEmailAsync(email, subject, body, cancellationToken);

        return Result.Success;
    }

    public async Task<Result<Success>> ResetPasswordAsync(string email, string token, string newPassword, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user is null)
        {
            return IdentityErrors.UserNotFound;
        }

        var resetResult = await _userManager.ResetPasswordAsync(user, token, newPassword);
        if (!resetResult.Succeeded)
        {
            var errors = resetResult.Errors.Select(e => Error.Validation(e.Code, e.Description)).ToList();
            return errors;
        }

        return Result.Success;
    }

    public async Task<Result<Success>> VerifyEmailAsync(string email, string token, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user is null) return IdentityErrors.UserNotFound;

        var result = await _userManager.ConfirmEmailAsync(user, token);
        if (!result.Succeeded)
        {
            return IdentityErrors.EmailConfirmationFailed;
        }

        return Result.Success;
    }

    public async Task<Result<Success>> ResendVerificationEmailAsync(string email, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user is null || user.EmailConfirmed)
        {
            return Result.Success;
        }

        var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
        var encodedToken = WebUtility.UrlEncode(token);

        var baseUrl = _configuration["AppSettings:ClientAppUrl"] ?? "http://localhost:4200";
        var verificationLink = $"{baseUrl}/verify-email?email={WebUtility.UrlEncode(email)}&token={encodedToken}";

        var subject = "Confirm your email";
        var body = $"Please confirm your account by clicking <a href='{verificationLink}'>here</a>.";

        await _notificationService.SendEmailAsync(email, subject, body, cancellationToken);

        return Result.Success;
    }

    public async Task<Result<Success>> ChangePasswordAsync(string userId, string currentPassword, string newPassword, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user is null) return IdentityErrors.UserNotFound;

        var result = await _userManager.ChangePasswordAsync(user, currentPassword, newPassword);
        if (!result.Succeeded)
        {
            return IdentityErrors.PasswordChangeFailed;
        }

        return Result.Success;
    }

    public async Task<Result<Success>> DeleteAccountAsync(string userId, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user is null) return IdentityErrors.UserNotFound;

        using var transaction = await ((DbContext)_context).Database.BeginTransactionAsync(cancellationToken);
        try
        {
            // 1. Detach companies
            var companies = await _context.Companies
                .Where(c => c.OwnerId == Guid.Parse(userId))
                .ToListAsync(cancellationToken);

            foreach (var company in companies)
            {
                company.ClearOwner();
            }

            // 2. Remove business owner profile
            var businessOwner = await _context.BusinessOwners
                .FirstOrDefaultAsync(b => b.Id == Guid.Parse(userId), cancellationToken);

            if (businessOwner != null)
            {
                _context.BusinessOwners.Remove(businessOwner);
            }

            await _context.SaveChangesAsync(cancellationToken);

            // 3. Delete user account
            var result = await _userManager.DeleteAsync(user);
            if (!result.Succeeded)
            {
                await transaction.RollbackAsync(cancellationToken);
                return IdentityErrors.AccountDeletionFailed;
            }

            await transaction.CommitAsync(cancellationToken);
            return Result.Success;
        }
        catch (Exception)
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }

    public async Task<Result<Success>> UpdateProfileAsync(string userId, string firstName, string lastName, string phoneNumber, string? companyPosition, CancellationToken cancellationToken)
    {
        var bo = await _context.BusinessOwners.FirstOrDefaultAsync(b => b.Id == Guid.Parse(userId), cancellationToken);
        if (bo == null)
        {
            return BusinessOwnerErrors.NotFound(Guid.Parse(userId));
        }

        var result = bo.UpdateProfile(firstName, lastName, phoneNumber, companyPosition);
        if (result.IsError) return result.Errors;

        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success;
    }
    public async Task<Result<List<AppUserDto>>> GetAllUsersAsync(CancellationToken cancellationToken = default)
    {
        var users = await _userManager.Users.ToListAsync(cancellationToken);
        var result = new List<AppUserDto>();

        foreach (var user in users)
        {
            var roles = await _userManager.GetRolesAsync(user);
            var bo = await _context.BusinessOwners.AsNoTracking().FirstOrDefaultAsync(b => b.Id == Guid.Parse(user.Id), cancellationToken);

            result.Add(new AppUserDto(
                user.Id,
                user.Email!,
                roles,
                bo?.FirstName,
                bo?.LastName,
                bo?.Phone,
                bo?.CompanyPosition
            ));
        }

        return result;
    }
}
