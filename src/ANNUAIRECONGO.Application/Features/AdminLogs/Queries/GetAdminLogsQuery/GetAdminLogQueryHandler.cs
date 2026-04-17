using ANNUAIRECONGO.Application.Common;
using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Features.AdminLogs.Dtos;
using ANNUAIRECONGO.Application.Features.AdminLogs.Mappers;
using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.AdminLogs.Queries.GetAdminLogsQuery;

public sealed record GetAdminLogsQueryHandler(IAppDbContext Context, ILogger<GetAdminLogsQueryHandler> Logger) : IRequestHandler<GetAdminLogsQuery, Result<PaginatedList<AdminLogDto>>>
{
    public async Task<Result<PaginatedList<AdminLogDto>>> Handle(GetAdminLogsQuery request, CancellationToken cancellationToken)
    {
        var query = Context.AdminLogs.AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            query = query.Where(log => log.Action.Contains(request.SearchTerm) || (log.Details != null && log.Details.Contains(request.SearchTerm)));
        }

        if (!string.IsNullOrWhiteSpace(request.Action))
        {
            query = query.Where(log => log.Action == request.Action);
        }

        if (!string.IsNullOrWhiteSpace(request.TargetType))
        {
            query = query.Where(log => log.TargetType == request.TargetType);
        }

        if (!string.IsNullOrWhiteSpace(request.AdminId))
        {
            query = query.Where(log => log.AdminId == request.AdminId);
        }

        if (request.StartDate.HasValue)
        {
            query = query.Where(log => log.CreatedAt >= request.StartDate.Value);
        }

        if (request.EndDate.HasValue)
        {
            query = query.Where(log => log.CreatedAt <= request.EndDate.Value);
        }

        query = query.OrderByDescending(log => log.CreatedAt);

        var totalCount = await query.CountAsync(cancellationToken);
        var totalPages = (int)Math.Ceiling((double)totalCount / request.PageSize);

        var adminLogs = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        if (adminLogs.Count == 0)
        {
            Logger.LogInformation("No admin logs found for the given criteria.");
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