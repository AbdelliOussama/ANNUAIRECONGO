using ANNUAIRECONGO.Application.Common;
using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Features.AdminLogs.Dtos;
using ANNUAIRECONGO.Application.Features.AdminLogs.Mappers;
using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.AdminLogs.Queries.GetEntityAdminLogsQuery;

public sealed record GetEntityAdminLogsQueryHandler(IAppDbContext Context, ILogger<GetEntityAdminLogsQueryHandler> Logger) : IRequestHandler<GetEntityAdminLogsQuery, Result<PaginatedList<AdminLogDto>>>
{
    public async Task<Result<PaginatedList<AdminLogDto>>> Handle(GetEntityAdminLogsQuery request, CancellationToken cancellationToken)
    {
        var query = Context.AdminLogs
            .Where(log => log.TargetType == request.TargetType && log.TargetId == request.TargetId)
            .OrderByDescending(log => log.CreatedAt);

        var totalCount = await query.CountAsync(cancellationToken);
        var totalPages = (int)Math.Ceiling((double)totalCount / request.PageSize);

        var adminLogs = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        if (adminLogs.Count == 0)
        {
            Logger.LogInformation("No admin logs found for target type {TargetType} and target id {TargetId}.", request.TargetType, request.TargetId);
            return new PaginatedList<AdminLogDto>
            {
                Items = new List<AdminLogDto>(),
                PageNumber = request.PageNumber,
                PageSize = request.PageSize,
                TotalCount = 0,
                TotalPages = 0
            };
        }

        var adminLogDtos = adminLogs.ToDtos();

        return new PaginatedList<AdminLogDto>
        {
            Items = adminLogDtos,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize,
            TotalCount = totalCount,
            TotalPages = totalPages
        };
    }
}