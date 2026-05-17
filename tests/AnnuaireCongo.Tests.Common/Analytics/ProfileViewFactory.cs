using ANNUAIRECONGO.Domain.Analytics;
using ANNUAIRECONGO.Domain.Common.Results;

namespace AnnuaireCongo.Tests.Common.Analytics;

public static class ProfileViewFactory
{
    public static Result<ProfileView> CreateProfileView(
        Guid? companyId = null,
        string? viewerIp = null)
    {
        return ProfileView.Create(
            companyId ?? Guid.NewGuid(),
            viewerIp ?? "41.202.208.15"
        );
    }
}
