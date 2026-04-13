
using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Features.Identity.Dtos;
using ANNUAIRECONGO.Domain.BusinessOwners;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;

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
        public IdentityService(UserManager<AppUser> userManager, IUserClaimsPrincipalFactory<AppUser> claimsPrincipalFactory, IAuthorizationService authorizationService,RoleManager<IdentityRole> roleManager,IAppDbContext context)
        {
            _userManager = userManager;
            _claimsPrincipalFactory = claimsPrincipalFactory;
            _authorizationService = authorizationService;
            _roleManager = roleManager;
            _context  = context;
        }
    #endregion

    public async Task<Result<AppUserDto>> AuthenticateAsync(string email, string password)
    {
        var user =await _userManager.FindByEmailAsync(email);
        if(user is null)
        {
            return Error.NotFound("User_Not_Found", $"User with email {UtilityService.MaskEmail(email)} not found");
        }
        if (!user.EmailConfirmed)
        {
            return Error.Conflict("Email_Not_Confirmed", $"email '{UtilityService.MaskEmail(email)}' not confirmed");
        }
        if(!await _userManager.CheckPasswordAsync(user, password))
        {
            return Error.Conflict("Invalid_Login_Attempt", "Email / Password are incorrect");
        }
        return new  AppUserDto(user.Id,user.Email,await _userManager.GetRolesAsync(user),await _userManager.GetClaimsAsync(user));
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
        var user =await _userManager.FindByIdAsync(userId);
        var roles =await _userManager.GetRolesAsync(user);
        var claims =await _userManager.GetClaimsAsync(user);

        return new  AppUserDto(user.Id,user.Email!,roles,claims);
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
            EmailConfirmed = true
        };

        var createResult = await _userManager.CreateAsync(appUser, password);
        if (!createResult.Succeeded)
        {
            return IdentityErrors.UserCreationFailed;
        }

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
}