using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Features.BusinessOwners.Dtos;
using ANNUAIRECONGO.Domain.Common.Results;

namespace ANNUAIRECONGO.Application.Features.BusinessOwners.Queries.GetBusinessOwners;

public sealed record GetBusinessOwnersQuery() : ICachedQuery<Result<List<BusinessOwnerDto>>>
{
    public string CacheKey => $"BusinessOwners";
    public string[] Tags => ["BusinessOwners"];
    public TimeSpan Expiration => TimeSpan.FromMinutes(10);
}