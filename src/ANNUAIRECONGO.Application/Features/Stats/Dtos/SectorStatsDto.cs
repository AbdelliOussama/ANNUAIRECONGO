namespace ANNUAIRECONGO.Application.Features.Stats.Dtos;

public sealed record SectorStatsDto(
    Guid SectorId,
    string SectorName,
    int CompanyCount);