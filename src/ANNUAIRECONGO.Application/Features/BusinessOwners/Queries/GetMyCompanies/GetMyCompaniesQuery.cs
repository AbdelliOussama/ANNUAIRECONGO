using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Features.Companies.Dtos;
using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.BusinessOwners.Queries.GetMyCompanies;

public sealed record GetMyCompaniesQuery : IRequest<Result<List<CompanyFollowDto>>>;
