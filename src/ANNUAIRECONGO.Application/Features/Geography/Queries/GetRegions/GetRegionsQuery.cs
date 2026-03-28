using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Features.Geography.Dtos;
using ANNUAIRECONGO.Domain.Common.Results;

namespace ANNUAIRECONGO.Application.Features.Geography.Queries.GetRegions;

public sealed record GetRegionsQuery : ICachedQuery<Result<List<RegionDto>>>
{
    public string CacheKey => "regions";
    public string[] Tags => ["geography", "region"];
    public TimeSpan Expiration => TimeSpan.FromMinutes(10);
}