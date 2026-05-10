using ANNUAIRECONGO.Application.Features.Companies.Dtos;
using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.Companies.Queries.GetCompanyBySlugQuery;

public sealed record GetCompanyBySlugQuery(string Slug,string? viewerIp) : IRequest<Result<CompanyDto>>;
