
using ANNUAIRECONGO.Domain.Common;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Companies;

namespace ANNUAIRECONGO.Domain.Analytics;

public sealed class ProfileView : Entity
{
    public Guid CompanyId { get; private set; }
    public string ViewerIp { get; private set; } = string.Empty;
    public DateTime ViewedAt { get; private set; }
    public Company Company { get; private set; } = null!;


    private ProfileView() { }

    private ProfileView(Guid companyId, string viewerIp, DateTime viewedAt)
    {
        CompanyId = companyId;
        ViewerIp = viewerIp;
        ViewedAt = viewedAt;
    }


    public static Result<ProfileView> Create(Guid companyId, string viewerIp)
    {
        if(string.IsNullOrWhiteSpace(viewerIp))
        {
            return ProfileViewErrors.viewerIpRequired;
        }
        return new ProfileView(companyId,viewerIp,DateTime.Now);
    }
}
