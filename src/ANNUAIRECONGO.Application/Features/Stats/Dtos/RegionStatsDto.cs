namespace ANNUAIRECONGO.Application.Features.Stats.Dtos;

public sealed record RegionStatsDto(
    Guid RegionId,
    string RegionName,
    int CompanyCount);