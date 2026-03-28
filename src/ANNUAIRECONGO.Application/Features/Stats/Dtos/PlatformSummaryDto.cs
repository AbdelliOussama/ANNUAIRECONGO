namespace ANNUAIRECONGO.Application.Features.Stats.Dtos;

public sealed record PlatformSummaryDto(
    int TotalCompanies,
    int ActiveCompanies,
    int TotalSubscriptions,
    int ActiveSubscriptions,
    decimal TotalRevenue);