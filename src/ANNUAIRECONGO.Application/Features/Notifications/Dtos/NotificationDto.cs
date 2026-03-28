using AnnuaireCongo.Domain.Notifications;

namespace ANNUAIRECONGO.Application.Features.Notifications.Dtos;

public sealed record NotificationDto(
    Guid Id,
    string UserId,
    string Type,
    string Message,
    bool IsRead,
    DateTime CreatedAt);