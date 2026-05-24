
using ANNUAIRECONGO.Domain.Common;
using ANNUAIRECONGO.Domain.Common.Results;

namespace ANNUAIRECONGO.Domain.Logs;

public class AdminLog : Entity
{
    public string AdminId { get; private set; } = string.Empty;
    public string Action { get; private set; } = string.Empty;
    public string TargetType { get; private set; } = string.Empty;
    public Guid TargetId { get; private set; }
    public string? Details { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }

    private AdminLog() { }

    private AdminLog(
        string adminId,
        string action,
        string targetType,
        Guid targetId,
        string? details) : base(Guid.NewGuid())
    {
        AdminId = adminId;
        Action = action;
        TargetType = targetType;
        TargetId = targetId;
        Details = details;
        CreatedAt = DateTimeOffset.UtcNow;
    }
    public static Result<AdminLog> Create(
        string adminId,
        string action,
        string targetType,
        Guid targetId,
        string? details = null)
    {
        if (string.IsNullOrWhiteSpace(adminId))
            return AdminLogErrors.AdminIdCannotBeEmpty;

        if (string.IsNullOrWhiteSpace(action))
            return AdminLogErrors.ActionCannotBeEmpty;

        if (string.IsNullOrWhiteSpace(targetType))
            return AdminLogErrors.TargetTypeCannotBeEmpty;

        if (targetId == Guid.Empty)
            return AdminLogErrors.TargetIdCannotBeEmpty;

        return new AdminLog(adminId, action, targetType, targetId, details);
    }
}
