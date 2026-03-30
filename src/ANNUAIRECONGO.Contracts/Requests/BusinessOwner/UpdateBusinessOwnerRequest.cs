namespace ANNUAIRECONGO.Contracts.Requests.BusinessOwner;

public class UpdateBusinessOwnerRequest
{
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string PhoneNumber { get; set; }
    public string? CompanyPosition { get; set; }
}