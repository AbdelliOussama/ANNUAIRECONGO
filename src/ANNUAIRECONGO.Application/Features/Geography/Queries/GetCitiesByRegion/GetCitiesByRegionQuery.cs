using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Features.Geography.Dtos;
using ANNUAIRECONGO.Domain.Common.Results;

namespace ANNUAIRECONGO.Application.Features.Geography.Queries.GetCitiesByRegion;

public sealed record GetCitiesByRegionQuery(Guid RegionId) : ICachedQuery<Result<List<CityDto>>>
{
    public string CacheKey => $"cities-by-region-{RegionId}";
    
    public string[] Tags => ["geography", "city", "region"];
    
    public TimeSpan Expiration => TimeSpan.FromMinutes(10);
}