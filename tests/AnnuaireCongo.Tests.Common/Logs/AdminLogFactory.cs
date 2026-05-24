using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Logs;

namespace AnnuaireCongo.Tests.Common.Logs;

public static class AdminLogFactory
{
    public static Result<AdminLog> CreateAdminLog(
        string? adminId = null,
        string? action = null,
        string? targetType = null,
        Guid? targetId = null,
        string? details = null)
    {
        return AdminLog.Create(
            adminId ?? "19a59129-6c20-417a-834d-11a208d32d96",
            action ?? "Validated Company",
            targetType ?? "Company",
            targetId ?? Guid.NewGuid(),
            details ?? "Company profile validated by administrator."
        );
    }
}
