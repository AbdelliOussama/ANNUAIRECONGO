using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Features.Stats.Dtos;
using ANNUAIRECONGO.Domain.Common.Results;

namespace ANNUAIRECONGO.Application.Features.Stats.Queries.GetRegionStats;

public sealed record GetRegionStatsQuery : ICachedQuery<Result<List<RegionStatsDto>>>
{
    public string CacheKey => "region-stats";
    
    public string[] Tags => ["stats", "region"];
    
    public TimeSpan Expiration => TimeSpan.FromMinutes(10);
}