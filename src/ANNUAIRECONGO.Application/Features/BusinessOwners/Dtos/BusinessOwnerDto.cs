namespace ANNUAIRECONGO.Application.Features.BusinessOwners.Dtos;
public class BusinessOwnerDto
{
    public Guid BusinessOwnerId { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string FullName => $"{FirstName} {LastName}";
    public string Phone { get; set; }
    public string? CompanyPosition{get;set;}

}