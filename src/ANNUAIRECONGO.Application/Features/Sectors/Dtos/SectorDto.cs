namespace ANNUAIRECONGO.Application.Features.Sectors.Dtos;

public class SectorDto
{
    public Guid SectorId { get; set; }
    public string Name { get;  set; } = string.Empty;
    public string Slug { get;  set; } = string.Empty;
    public string? IconUrl { get; set; }
    public string? Description { get;  set; }
    public bool IsActive { get;  set; } = true;

}