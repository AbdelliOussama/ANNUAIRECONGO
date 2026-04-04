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
    Task<Result<Guid>> RegisterAsync(string email, string password, string firstName, string lastName, string phoneNumber, string? companyPosition, CancellationToken cancellationToken);
}