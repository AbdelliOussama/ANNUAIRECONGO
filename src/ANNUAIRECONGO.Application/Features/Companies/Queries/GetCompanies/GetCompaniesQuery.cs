using ANNUAIRECONGO.Application.Common;
using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Features.Companies.Dtos;
using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.Companies.Queries.GetCompanies;

public sealed record GetCompaniesQuery : ICachedQuery<Result<PaginatedList<CompanyDto>>>
{
    public string CacheKey => "Companies";

    public string[] Tags => ["Company"];

    public TimeSpan Expiration => TimeSpan.FromMinutes(10);
}