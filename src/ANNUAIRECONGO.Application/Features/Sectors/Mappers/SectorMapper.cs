using ANNUAIRECONGO.Application.Features.Sectors.Dtos;
using ANNUAIRECONGO.Domain.Sectors;

namespace ANNUAIRECONGO.Application.Features.Sectors.Mappers;

public static class SectorMapper
{
    public static SectorDto ToDto(this Sector sector)
    {
        ArgumentNullException.ThrowIfNull(sector);
        return new  SectorDto
        {
            SectorId = sector.Id,
            Name = sector.Name,
            Slug = sector.Slug,
            IconUrl = sector.IconUrl,
            Description = sector.Description,
            IsActive = sector.IsActive
        };
    }
    public static List<SectorDto> ToDtos(this IEnumerable<Sector> sectors)
    {
        return [..sectors.Select(s => s.ToDto())];
    }
}