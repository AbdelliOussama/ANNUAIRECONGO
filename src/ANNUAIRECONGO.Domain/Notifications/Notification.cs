
using ANNUAIRECONGO.Domain.Common;

namespace AnnuaireCongo.Domain.Notifications;

public class Notification : Entity
{
    public string UserId { get; private set; } = string.Empty;
    public string Type { get; private set; } = string.Empty;
    public string Message { get; private set; } = string.Empty;
    public bool IsRead { get; private set; }
    public DateTime CreatedAt { get; private set; }

    private Notification() { }

    public static Notification Create(string userId, string type, string message)
    {
        return new Notification
        {
            UserId = userId,
            Type = type,
            Message = message,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };
    }

    public void MarkAsRead() => IsRead = true;
}

// ── Notification type constants ───────────────────────────────────────────
public static class NotificationTypes
{
    public const string CompanyValidated      = "company_validated";
    public const string CompanyRejected       = "company_rejected";
    public const string CompanySuspended      = "company_suspended";
    public const string CompanyReactivated    = "company_reactivated";
    public const string SubscriptionActivated = "subscription_activated";
    public const string SubscriptionExpiring  = "subscription_expiring";
    public const string SubscriptionExpired   = "subscription_expired";
    public const string PaymentSucceeded      = "payment_succeeded";
    public const string PaymentFailed         = "payment_failed";
}
