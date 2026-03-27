using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Features.Sectors.Dtos;
using ANNUAIRECONGO.Domain.Common.Results;

namespace ANNUAIRECONGO.Application.Features.Sectors.Queries.GetSectors;

public sealed record GetSectorsQuery : ICachedQuery<Result<List<SectorDto>>>
{
    public string CacheKey => "sectors_all";
    public string[] Tags => ["sector"];
    public TimeSpan Expiration => TimeSpan.FromMinutes(10);
}