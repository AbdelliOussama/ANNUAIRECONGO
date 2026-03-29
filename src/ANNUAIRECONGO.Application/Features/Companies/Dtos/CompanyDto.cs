using ANNUAIRECONGO.Domain.Companies.Enums;
using ANNUAIRECONGO.Application.Features.Sectors.Dtos;

namespace ANNUAIRECONGO.Application.Features.Companies.Dtos;
public class CompanyDto
{
    public Guid Id { get; set; }
    public Guid OwnerId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? LogoUrl { get; set; }
    public string? CoverUrl { get; set; }
    public string? Website { get; set; }
    public Guid CityId { get; set; }
    public string? Address { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public string? CityName { get; set; }
    public string? RegionName { get; set; }
    public CompanyStatus Status { get; set; }
    public string? RejectionReason { get; set; }
    public bool IsFeatured { get; set; }
    public Guid? ActiveSubscriptionId { get; set; }
    public List<SectorDto> Sectors { get; set; } = new();
}