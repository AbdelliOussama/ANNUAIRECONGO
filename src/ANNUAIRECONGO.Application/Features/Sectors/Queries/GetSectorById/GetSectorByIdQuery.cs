using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Features.Sectors.Dtos;
using ANNUAIRECONGO.Domain.Common.Results;

namespace ANNUAIRECONGO.Application.Features.Sectors.Queries.GetSectorById;

public sealed record GetSectorByIdQuery(Guid sectorId) : ICachedQuery<Result<SectorDto>>
{
    public string CacheKey => $"sector_{sectorId}";
    public string[] Tags => ["sector"];
    public TimeSpan Expiration => TimeSpan.FromMinutes(10);
}