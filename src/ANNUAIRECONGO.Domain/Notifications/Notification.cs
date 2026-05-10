using ANNUAIRECONGO.Domain.Common;
using ANNUAIRECONGO.Domain.Common.Results;

namespace ANNUAIRECONGO.Domain.Notifications;

/// <summary>
/// User-facing notification.
///
/// Audit fix #2 (May 2026 deep audit):
///   - <see cref="Link"/> added so the FE can navigate from the toast / list
///     entry to the relevant page (e.g. /espace/abonnement when a payment
///     succeeds, /annuaire/{slug} when a fiche is validated).
///   - <see cref="Tone"/> added as a canonical mapping for FE styling
///     ('info' / 'success' / 'warning' / 'error'). The legacy <see cref="Type"/>
///     string (e.g. "payment_succeeded") is kept for routing / templating.
/// </summary>
public class Notification : Entity
{
    public string UserId { get; private set; } = string.Empty;
    public string Type { get; private set; } = string.Empty;
    public string Tone { get; private set; } = NotificationTone.Info;
    public string Message { get; private set; } = string.Empty;
    public string? Link { get; private set; }
    public bool IsRead { get; private set; }
    public DateTime CreatedAt { get; private set; }

    private Notification() { }

    private Notification(string userId, string type, string tone, string message, string? link) : base(Guid.NewGuid())
    {
        UserId = userId;
        Type = type;
        Tone = tone;
        Message = message;
        Link = link;
        IsRead = false;
        CreatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Create a notification. <paramref name="tone"/> defaults to a tone
    /// derived from <paramref name="type"/> when not provided, and
    /// <paramref name="link"/> is optional (omit for purely informational
    /// notifications without a destination).
    /// </summary>
    public static Result<Notification> Create(
        string userId,
        string type,
        string message,
        string? link = null,
        string? tone = null)
    {
        if (string.IsNullOrWhiteSpace(userId))
            return NotificationErrors.UserNotFound;

        return new Notification(
            userId,
            type,
            string.IsNullOrWhiteSpace(tone) ? NotificationTone.FromType(type) : tone,
            message,
            link);
    }

    public Result<Updated> MarkAsRead()
    {
        if (IsRead)
            return NotificationErrors.AlreadyRead("Notification is already marked as read.");

        IsRead = true;
        return Result.Updated;
    }
}
