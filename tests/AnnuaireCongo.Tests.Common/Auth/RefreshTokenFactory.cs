using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Identity;

namespace AnnuaireCongo.Tests.Common.Auth;

public static class RefreshTokenFactory
{
    public static Result<RefreshToken> CreateRefreshToken(Guid? id = null, string? token = null, string? userId = null, DateTimeOffset? expiresOnUtc = null)
    {
        return RefreshToken.Create(
            id ?? Guid.NewGuid(),
            token ?? "sample-refresh-token",
            userId ?? "sample-user-id",
            expiresOnUtc ?? DateTimeOffset.UtcNow.AddDays(7)
        );
    }
}