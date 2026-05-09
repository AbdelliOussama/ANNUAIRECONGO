using AnnuaireCongo.Domain.Notifications;

namespace ANNUAIRECONGO.Application.Features.Notifications.Dtos;

/// <summary>
/// Notification read model. Field names align with the FE's Notification
/// interface so the JSON contract is 1:1.
///
/// Audit fix #2 (May 2026 deep audit):
///   - <see cref="Link"/> added so the FE can navigate from the list entry.
///   - <see cref="Tone"/> added for canonical FE styling.
/// </summary>
public sealed record NotificationDto(
    Guid     Id,
    string   UserId,
    string   Type,
    string   Tone,
    string   Message,
    string?  Link,
    bool     IsRead,
    DateTime CreatedAt);
