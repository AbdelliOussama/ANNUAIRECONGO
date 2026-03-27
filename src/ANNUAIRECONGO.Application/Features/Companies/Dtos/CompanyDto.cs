using ANNUAIRECONGO.Domain.Companies.Enums;

namespace ANNUAIRECONGO.Application.Features.Companies.Dtos;
public class CompanyDto
{
    public Guid Id { get; set; }
    public Guid OwnerId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public Guid CityId { get; set; }
    public CompanyStatus Status { get; set; }
    public bool IsFeatured { get; set; }
    public string? RejectionReason { get; set; }
}