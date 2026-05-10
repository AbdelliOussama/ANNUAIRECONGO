namespace ANNUAIRECONGO.Contracts.Requests.BusinessOwner;

public class UpdateBusinessOwnerRequest
{
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public required string PhoneNumber { get; set; }
    public string? CompanyPosition { get; set; }
}
