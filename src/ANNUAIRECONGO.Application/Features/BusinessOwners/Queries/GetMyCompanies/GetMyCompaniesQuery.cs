using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Features.Companies.Dtos;
using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.BusinessOwners.Queries.GetMyCompanies;

public sealed record GetMyCompaniesQuery : ICachedQuery<Result<List<CompanyDto>>>
{
    public string CacheKey =>"MyCompanies";

    public string[] Tags => ["Company"];

    public TimeSpan Expiration => TimeSpan.FromMinutes(5);
}