using ANNUAIRECONGO.Application.Common;
using ANNUAIRECONGO.Application.Features.Companies.Dtos;
using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.Companies.Queries.GetCompanies;

public sealed record GetCompaniesQuery(
    string? SearchTerm,
    Guid? SectorId,
    string? SectorSlug,
    Guid? CityId,
    Guid? RegionId,
    int? Status,
    string? Rccm,
    string? Niu,
    string? SortBy,
    string? SortOrder,
    int PageNumber,
    int PageSize) : IRequest<Result<PaginatedList<CompanyDto>>>;
