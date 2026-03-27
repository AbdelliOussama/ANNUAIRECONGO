
using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Features.Identity.Dtos;
using ANNUAIRECONGO.Domain.Common.Results;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;

namespace ANNUAIRECONGO.Infrastructure.Identity;

public class IdentityService : IIdentityService
{
    #region  Fields
        private readonly UserManager<AppUser> _userManager;
        private readonly IUserClaimsPrincipalFactory<AppUser> _claimsPrincipalFactory;
        private readonly IAuthorizationService _authorizationService;
    #endregion

    #region  Constructors
        public IdentityService(UserManager<AppUser> userManager, IUserClaimsPrincipalFactory<AppUser> claimsPrincipalFactory, IAuthorizationService authorizationService)
        {
            _userManager = userManager;
            _claimsPrincipalFactory = claimsPrincipalFactory;
            _authorizationService = authorizationService;
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
}