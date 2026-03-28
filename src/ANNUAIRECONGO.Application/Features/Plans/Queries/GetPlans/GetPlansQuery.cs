using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Features.Plans.Dtos;
using ANNUAIRECONGO.Domain.Common.Results;

namespace ANNUAIRECONGO.Application.Features.Plans.Queries.GetPlans;

public sealed record GetPlansQuery : ICachedQuery<Result<List<PlanDto>>>
{
    public string CacheKey => "plans";
    
    public string[] Tags => ["plans"];
    
    public TimeSpan Expiration => TimeSpan.FromMinutes(10);
}