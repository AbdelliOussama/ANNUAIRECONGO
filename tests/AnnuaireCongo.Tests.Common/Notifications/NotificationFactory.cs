using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Notifications;

namespace AnnuaireCongo.Tests.Common.Notifications;

public static class NotificationFactory
{
    public static Result<Notification> CreateNotification(
        string? userId = null,
        string? type = null,
        string? message = null,
        string? link = null,
        string? tone = null)
    {
        return Notification.Create(
            userId ?? Guid.NewGuid().ToString(),
            type ?? "company_validated",
            message ?? "Votre fiche entreprise a été validée avec succès.",
            link ?? "/espace/fiches",
            tone ?? null
        );
    }

    /// <summary>
    /// Creates a notification for a successful payment, simulating
    /// the notification fired after a subscription payment is confirmed.
    /// </summary>
    public static Result<Notification> CreatePaymentSuccessNotification(
        string? userId = null,
        string? reference = null)
    {
        return Notification.Create(
            userId ?? Guid.NewGuid().ToString(),
            "payment_succeeded",
            $"Votre paiement {reference ?? "F-2026-TEST01"} a bien été reçu. Votre abonnement est actif.",
            "/espace/abonnement"
        );
    }

    /// <summary>
    /// Creates a notification for an expiring subscription, simulating
    /// the warning notification sent 7 days before expiry.
    /// </summary>
    public static Result<Notification> CreateSubscriptionExpiringNotification(
        string? userId = null,
        int daysLeft = 7)
    {
        return Notification.Create(
            userId ?? Guid.NewGuid().ToString(),
            "subscription_expiring_soon",
            $"Votre abonnement expire dans {daysLeft} jours. Renouvelez-le pour conserver votre visibilité.",
            "/espace/abonnement"
        );
    }
}
