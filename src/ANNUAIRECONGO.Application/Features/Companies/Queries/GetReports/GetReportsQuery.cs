using ANNUAIRECONGO.Application.Common;
using ANNUAIRECONGO.Application.Features.Companies.Dtos;
using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.Companies.Queries.GetReports;

public sealed record GetReportsQuery(
    int PageNumber = 1,
    int PageSize = 20) : IRequest<Result<PaginatedList<CompanyReportDto>>>;
