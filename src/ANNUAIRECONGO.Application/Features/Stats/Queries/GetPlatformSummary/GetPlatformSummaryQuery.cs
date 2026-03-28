using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Features.Stats.Dtos;
using ANNUAIRECONGO.Domain.Common.Results;

namespace ANNUAIRECONGO.Application.Features.Stats.Queries.GetPlatformSummary;

public sealed record GetPlatformSummaryQuery : ICachedQuery<Result<PlatformSummaryDto>>
{
    public string CacheKey => "platform-summary";
    
    public string[] Tags => ["stats", "platform"];
    
    public TimeSpan Expiration => TimeSpan.FromMinutes(10);
}