
using ANNUAIRECONGO.Domain.Common.Results;

namespace ANNUAIRECONGO.Domain.Sectors;

public static class SectorErrors
{
    public static Error SectorNotFound(Guid id)=> Error.NotFound(
        "Sector.NotFound",
        $"Sector with id '{id}' was not found.");

    public static Error NameAlreadyExists(string name) => Error.Conflict(
        "Sector.NameAlreadyExists",
        $"A sector with the name '{name}' already exists.");



    public static readonly Error SlugAlreadyExists =Error.Conflict(
        "Sector.SlugAlreadyExists",
        "A sector with this name already exists.");

    public static readonly Error Inactive = Error.Failure(
        "Sector.Inactive",
        "This sector is inactive and cannot be assigned to a company.");

    public static readonly Error NameIsRequired = Error.Validation(
        "Sector.NameIsRequired",
        "Sector name is required.");

    public static Result<Sector> IdRequired  = Error.Validation(
        "Sector.IdIsRequired",
        "Sector id is required.");
}
