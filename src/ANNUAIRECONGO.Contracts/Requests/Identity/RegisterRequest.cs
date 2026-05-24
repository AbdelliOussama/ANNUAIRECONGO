namespace ANNUAIRECONGO.Contracts.Requests.Identity;

public class RegisterRequest
{
    public required string Email { get; set; }
    public required string Password { get; set; }
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public required string PhoneNumber { get; set; }
    public string? CompanyPosition { get; set; }
    public required string CompanyName { get; set; }
    public Guid CityId { get; set; }
    public List<Guid> SectorIds { get; set; } = new();
    public string? Website { get; set; }
    public string? Rccm { get; set; }
    public string? Niu { get; set; }
}
