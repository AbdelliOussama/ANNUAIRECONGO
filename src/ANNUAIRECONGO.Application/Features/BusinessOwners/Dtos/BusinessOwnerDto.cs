namespace ANNUAIRECONGO.Application.Features.BusinessOwners.Dtos;
public class BusinessOwnerDto
{
    public Guid BusinessOwnerId { get; set; }
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public string FullName => $"{FirstName} {LastName}";
    public required string Phone { get; set; }
    public required string Email { get; set; }
    public string? CompanyPosition{get;set;}

}
