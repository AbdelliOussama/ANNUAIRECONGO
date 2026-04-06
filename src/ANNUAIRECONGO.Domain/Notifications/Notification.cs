
using ANNUAIRECONGO.Domain.Common;
using ANNUAIRECONGO.Domain.Common.Results;
namespace AnnuaireCongo.Domain.Notifications;

public class Notification : Entity
{
    public string UserId { get; private set; } = string.Empty;
    public string Type { get; private set; } = string.Empty;
    public string Message { get; private set; } = string.Empty;
    public bool IsRead { get; private set; }
    public DateTime CreatedAt { get; private set; }
    private Notification() { }
    private Notification(string userId, string type, string message)
    {
        UserId = userId;
        Type = type;
        Message = message;
        IsRead = false;
        CreatedAt = DateTime.UtcNow;
    }
    public static Result<Notification> Create(string userId, string type, string message)
    {
        if(string.IsNullOrWhiteSpace(userId))
            return NotificationErrors.UserNotFound;
        return new Notification(userId, type, message);
    }
    public Result<Updated> MarkAsRead()
    {
        if (IsRead)
            return NotificationErrors.AlreadyRead("Notification is already marked as read.");

        IsRead = true;
        return Result.Updated;
    }
}
