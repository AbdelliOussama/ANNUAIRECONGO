using ANNUAIRECONGO.Application.Common;
using ANNUAIRECONGO.Application.Features.AdminLogs.Dtos;
using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.AdminLogs.Queries.GetEntityAdminLogsQuery;

public sealed record GetEntityAdminLogsQuery(
    string TargetType,
    Guid TargetId,
    int PageNumber,
    int PageSize) : IRequest<Result<PaginatedList<AdminLogDto>>>;