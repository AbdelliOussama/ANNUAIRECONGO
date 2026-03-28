using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Features.Notifications.Dtos;
using ANNUAIRECONGO.Domain.Common.Results;

namespace ANNUAIRECONGO.Application.Features.Notifications.Queries.GetMyNotifications;

public sealed record GetMyNotificationsQuery(string UserId) : ICachedQuery<Result<List<NotificationDto>>>
{
    public string CacheKey => $"user-notifications-{UserId}";
    
    public string[] Tags => ["notifications", "user"];
    
    public TimeSpan Expiration => TimeSpan.FromMinutes(10);
}