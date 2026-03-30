using ANNUAIRECONGO.Application.Features.Geography.Dtos;
using ANNUAIRECONGO.Domain.Geography;

namespace ANNUAIRECONGO.Application.Features.Geography.Mappers;

public static class GeographyMappers
{
    public static CityDto ToDto(this City city)
    {
        return new CityDto
        {
            Id = city.Id,
            Name = city.Name,
            RegionId = city.RegionId
        };
    }
    public static List<CityDto> ToDtos(this IEnumerable<City> cities)
    {
        return [.. cities.Select(c=>c.ToDto())];
    }
    public static RegionDto ToDto(this Region region)
    {
        return new RegionDto
        {
            Id = region.Id,
            Name = region.Name
        };
    }
    public static List<RegionDto> ToDtos(this IEnumerable<Region> regions)
    {
        return [.. regions.Select(r=>r.ToDto())];
    }
}
