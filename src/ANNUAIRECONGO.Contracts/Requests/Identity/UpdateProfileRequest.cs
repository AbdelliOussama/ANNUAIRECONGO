namespace ANNUAIRECONGO.Contracts.Requests.Identity;

public sealed record UpdateProfileRequest(
    string FirstName,
    string LastName,
    string PhoneNumber,
    string? CompanyPosition);
