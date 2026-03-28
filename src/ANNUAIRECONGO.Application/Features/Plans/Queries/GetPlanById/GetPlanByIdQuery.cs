using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Features.Plans.Dtos;
using ANNUAIRECONGO.Domain.Common.Results;

namespace ANNUAIRECONGO.Application.Features.Plans.Queries.GetPlanById;

public sealed record GetPlanByIdQuery(Guid Id) : ICachedQuery<Result<PlanDto>>
{
    public string CacheKey => $"plan-{Id}";
    public string[] Tags => ["plans"];
    public TimeSpan Expiration => TimeSpan.FromMinutes(10);
}