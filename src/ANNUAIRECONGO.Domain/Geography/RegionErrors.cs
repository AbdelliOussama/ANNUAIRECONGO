
using ANNUAIRECONGO.Domain.Common.Results;

namespace ANNUAIRECONGO.Domain.Geography;

public static class RegionErrors
{
    public static readonly Error RegionIdRequired = Error.Validation(
        "Region.Id-Required",
        " region Id is Required.");
    public static readonly Error NameRequired = Error.Validation(
        "Region.Name-Required",
        " region Name is Required.");
    public static Error RegionNotFound(Guid id) => Error.NotFound(
        "Region.NotFound",
        $"Region with id '{id}' was not found.");

    public static readonly Error SlugAlreadyExists = Error.Conflict(
        "Region.SlugAlreadyExists",
        "A region with this name already exists.");
}
