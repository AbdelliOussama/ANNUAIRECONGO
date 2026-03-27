using ANNUAIRECONGO.Domain.Common.Results;

namespace ANNUAIRECONGO.Domain.Analytics;

public static class ProfileViewErrors
{
    public static Error viewerIpRequired => Error.Validation("ViewerIpRequired", "The viewer IP address is required.");
}
