using ANNUAIRECONGO.Domain.Common.Results;

namespace AnnuaireCongo.Domain.Notifications;

public static class NotificationErrors
{
    public static Error NotFound(Guid id) => Error.NotFound(
        "Notification.NotFound",
        $"Notification with id '{id}' was not found.");

    public static Error AlreadyRead(string message)
        => Error.Conflict(
            "Notification.AlreadyRead",
            message);

    public static Error UserNotFound = Error.NotFound(
        "Notification.UserNotFound",
        "User not found.");
}