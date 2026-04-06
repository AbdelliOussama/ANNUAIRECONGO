namespace AnnuaireCongo.Domain.Notifications;

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
