using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Features.Identity.Commands.Register;
using ANNUAIRECONGO.Domain.BusinessOwners;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Identity;
using Microsoft.AspNetCore.Identity;

namespace ANNUAIRECONGO.Infrastructure.Identity;

public class RegistrationService : IRegistrationService
{
    private readonly IAppDbContext _context;
    private readonly UserManager<AppUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;

    public RegistrationService(
        IAppDbContext context,
        UserManager<AppUser> userManager,
        RoleManager<IdentityRole> roleManager)
    {
        _context = context;
        _userManager = userManager;
        _roleManager = roleManager;
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

        _context.BusinessOwners.Add(businessOwnerResult.Value);
        await _context.SaveChangesAsync(cancellationToken);

        return businessOwnerResult.Value.Id;
    }
}