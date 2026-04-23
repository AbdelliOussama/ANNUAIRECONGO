using ANNUAIRECONGO.Domain.Common;
using ANNUAIRECONGO.Domain.Common.Results;

namespace ANNUAIRECONGO.Domain.Companies;

public class CompanyFollow : AuditableEntity
{
    public Guid CompanyId { get; private set; }
    public string UserId { get; private set; } = string.Empty;
    public DateTimeOffset FollowedAt { get; private set; }
    public DateTimeOffset? LastCheckedAt { get; private set; }
    public bool IsEmailEnabled { get; private set; }
    private CompanyFollow() { }

    private CompanyFollow(Guid id, Guid companyId, string userId, DateTimeOffset followedAt) : base(id)
    {
        CompanyId = companyId;
        UserId = userId;
        FollowedAt = followedAt;
        IsEmailEnabled = true;
    }
    public static Result<CompanyFollow> Create(Guid companyId, string userId)
    {
        return new CompanyFollow(Guid.NewGuid(), companyId, userId, DateTimeOffset.UtcNow);
    }
    public Result<Updated> ToggleEmailEnabled(bool isEnabled)
    {
        if (isEnabled == IsEmailEnabled)
        {
            return Result.Updated;
        }

        IsEmailEnabled = isEnabled;
        return Result.Updated;
    }
    public Result<Updated> SetLastChecked()
    {
        LastCheckedAt = DateTimeOffset.UtcNow;
        return Result.Updated;
    }
}