using ANNUAIRECONGO.Domain.Common.Results;

namespace AnnuaireCongo.Domain.Notifications;

public static class NotificationErrors
{
    public static Error NotFound(Guid id) => Error.NotFound(
        "Notification.NotFound",
        $"Notification with id '{id}' was not found.");
}