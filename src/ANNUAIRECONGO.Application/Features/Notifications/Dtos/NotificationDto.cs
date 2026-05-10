using ANNUAIRECONGO.Domain.Notifications;

namespace ANNUAIRECONGO.Application.Features.Notifications.Dtos;

/// <summary>
/// Notification read model. Field names align with the FE Notification
/// interface so the JSON contract is 1:1.
///
/// Audit fix #2 (May 2026 deep audit):
///   - Link: where to navigate when the user clicks the notification.
///   - Tone: canonical FE styling marker (info / success / warning / error).
/// </summary>
public sealed record NotificationDto(
    Guid     Id,
    string   UserId,
    string   Type,
    string   Tone,
    string   Message,
    string?  Link,
    bool     IsRead,
    DateTimeOffset CreatedAt);
