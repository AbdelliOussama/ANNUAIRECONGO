using ANNUAIRECONGO.Application.Features.AdminLogs.Dtos;
using ANNUAIRECONGO.Domain.Logs;

namespace ANNUAIRECONGO.Application.Features.AdminLogs.Mappers;

public static class AdminLogMapper
{
    public static AdminLogDto ToDto(this AdminLog adminLog)
    {
        return new AdminLogDto
        {
            Id = adminLog.Id,
            AdminId = adminLog.AdminId,
            Action = adminLog.Action,
            CreatedAt = adminLog.CreatedAt,
            TargetType = adminLog.TargetType,
            TargetId = adminLog.TargetId,
            Details = adminLog.Details
        };
    }

    public static List<AdminLogDto> ToDtos(this IEnumerable<AdminLog> adminLogs)
    {
        return [..adminLogs.Select(al => al.ToDto())];
    }
}