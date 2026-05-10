namespace ANNUAIRECONGO.Application.Features.Identity.Dtos;

public sealed record AppUserDto(
    string UserId,
    string Email,
    IList<string> Roles,
    string? FirstName = null,
    string? LastName = null,
    string? PhoneNumber = null,
    string? CompanyPosition = null
);
