using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Features.Companies.Dtos;
using ANNUAIRECONGO.Domain.Common.Results;

namespace ANNUAIRECONGO.Application.Features.Companies.Queries.GetCompanyById;

public sealed record GetCompanyByIdQuery(Guid id,string? viewerIp) : ICachedQuery<Result<CompanyFollowDto>>
{
    public string CacheKey => $"company-{id}";

    public string[] Tags => ["company"];

    public TimeSpan Expiration => TimeSpan.FromMinutes(10);
}