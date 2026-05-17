using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Geography;

namespace AnnuaireCongo.Tests.Common.Geography;

public static class CityFactory
{
    public static Result<City> CreateCity(
        Guid? id = null,
        Guid? regionId = null,
        string? name = null)
    {
        return City.Create(
            id ?? Guid.NewGuid(),
            regionId ?? Guid.NewGuid(),
            name ?? "Makélékélé"
        );
    }
}
