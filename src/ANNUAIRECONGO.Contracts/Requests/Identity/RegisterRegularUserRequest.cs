namespace ANNUAIRECONGO.Contracts.Requests.Identity;

/// <summary>
/// Request body for <c>POST /identity/register/user</c>.
/// Used when a visitor chooses the "Utilisateur / Consultant" path at inscription.
/// No company fields are present.
/// </summary>
public class RegisterRegularUserRequest
{
    public required string Email       { get; set; }
    public required string Password    { get; set; }
    public required string FirstName   { get; set; }
    public required string LastName    { get; set; }
    public required string PhoneNumber { get; set; }
}
