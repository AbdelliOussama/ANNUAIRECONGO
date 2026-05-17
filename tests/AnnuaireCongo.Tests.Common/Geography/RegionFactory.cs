using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Geography;

namespace AnnuaireCongo.Tests.Common.Geography;

public static class RegionFactory
{
    public static Result<Region> CreateRegion(
        Guid? id = null,
        string? name = null)
    {
        return Region.Create(
            id ?? Guid.NewGuid(),
            name ?? "Brazzaville"
        );
    }
}
