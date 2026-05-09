namespace AnnuaireCongo.Domain.Notifications;

/// <summary>
/// Canonical tones used by the frontend to colour-code notifications.
/// Keep these strings in sync with the FE's <c>NotificationTone</c> union
/// type ('info' | 'success' | 'warning' | 'error').
/// </summary>
public static class NotificationTone
{
    public const string Info    = "info";
    public const string Success = "success";
    public const string Warning = "warning";
    public const string Error   = "error";

    /// <summary>
    /// Map a domain <see cref="NotificationTypes"/> value to a sensible default
    /// tone. The FE may override per-notification by setting Tone explicitly
    /// when calling <c>Notification.Create</c>.
    /// </summary>
    public static string FromType(string type) => type switch
    {
        NotificationTypes.CompanyValidated      => Success,
        NotificationTypes.CompanyReactivated    => Success,
        NotificationTypes.SubscriptionActivated => Success,
        NotificationTypes.PaymentSucceeded      => Success,

        NotificationTypes.SubscriptionExpiring  => Warning,

        NotificationTypes.CompanyRejected       => Error,
        NotificationTypes.CompanySuspended      => Error,
        NotificationTypes.PaymentFailed         => Error,
        NotificationTypes.SubscriptionExpired   => Error,
        NotificationTypes.SubscriptionCancelled => Error,

        _ => Info,
    };
}
