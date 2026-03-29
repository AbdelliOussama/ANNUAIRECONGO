namespace ANNUAIRECONGO.Contracts.Requests.BusinessOwner;

public class UpdateBusinessOwnerRequest
{
    public string Name { get; set; }
    public string Email { get; set; }
    public string PhoneNumber { get; set; }
    public string? CompanyPosition { get; set; }
}