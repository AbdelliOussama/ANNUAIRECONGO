using ANNUAIRECONGO.Domain.Common.Results;

namespace ANNUAIRECONGO.Domain.Logs;

public static class AdminLogErrors
{
    public static Error AdminIdCannotBeEmpty = Error.Validation("AdminId cannot be empty.");

    public static Error ActionCannotBeEmpty = Error.Validation("Action cannot be empty.");

    public static Error TargetTypeCannotBeEmpty = Error.Validation("TargetType cannot be empty.");

    public static Error TargetIdCannotBeEmpty = Error.Validation("TargetId cannot be empty.");
}
