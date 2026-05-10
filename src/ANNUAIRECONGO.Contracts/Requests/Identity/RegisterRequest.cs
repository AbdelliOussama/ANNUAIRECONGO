namespace ANNUAIRECONGO.Contracts.Requests.Identity;

public class RegisterRequest
{
    public required string Email {get;set;}
    public required string Password {get;set;}
    public required string FirstName{get;set;}
    public required string LastName{get;set;}
    public required string PhoneNumber{get;set;}
    public string? CompanyPosition{get;set;}
}
