using ANNUAIRECONGO.Application.Common;
using ANNUAIRECONGO.Application.Features.AdminLogs.Dtos;
using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.AdminLogs.Queries.GetAdminLogsQuery;

public sealed record GetAdminLogsQuery(
    string? SearchTerm,
    string? Action,
    string? TargetType,
    string? AdminId,
    DateTimeOffset? StartDate,
    DateTimeOffset? EndDate,
    int PageNumber,
    int PageSize) : IRequest<Result<PaginatedList<AdminLogDto>>>;
