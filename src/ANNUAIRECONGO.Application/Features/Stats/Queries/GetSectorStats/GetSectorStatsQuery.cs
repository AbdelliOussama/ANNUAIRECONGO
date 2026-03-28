using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Features.Stats.Dtos;
using ANNUAIRECONGO.Domain.Common.Results;

namespace ANNUAIRECONGO.Application.Features.Stats.Queries.GetSectorStats;

public sealed record GetSectorStatsQuery : ICachedQuery<Result<List<SectorStatsDto>>>
{
    public string CacheKey => "sector-stats";
    
    public string[] Tags => ["stats", "sector"];
    
    public TimeSpan Expiration => TimeSpan.FromMinutes(10);
}