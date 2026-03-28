
using ANNUAIRECONGO.Domain.Common.Results;

namespace ANNUAIRECONGO.Domain.Geography;

public static class CityErrors
{
    public static readonly Error CityIdRequired = Error.Validation(
        "City.Id-Required",
        " City Id is Required.");
    public static readonly Error NameRequired = Error.Validation(
        "City.Name-Required",
        " City Name is Required.");
    public static readonly Error RegionIdRequired = Error.Validation(
        "Region.Id-Required",
        " region Id is Required.");
    public static Error CityNotFound(Guid id) =>Error.NotFound(
        "City.NotFound",
        $"City with id '{id}' was not found.");

    public static readonly Error SlugAlreadyExists = Error.Conflict(
        "City.SlugAlreadyExists",
        "A city with this name already exists in this region.");

    public static Error NameAlreadyExists = Error.Conflict(
        "City.NameAlreadyExists",
        "A city with this name already exists.");


    public static Error RegionNotFound(Guid regionId) =>Error.NotFound(
        "City.RegionNotFound",
        $"Region with id '{regionId}' was not found.");
}
