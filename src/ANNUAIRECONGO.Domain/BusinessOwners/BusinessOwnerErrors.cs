using ANNUAIRECONGO.Domain.Common.Results;

namespace ANNUAIRECONGO.Domain.BusinessOwners;

public static class BusinessOwnerErrors
{
    public static readonly Error IdRequired =
        Error.Validation("Employee.Id.Required", "Employee Id is required.");

    public static Error FirstNameRequired =>
        Error.Validation("Employee.FirstName.Required", "First name is required.");

    public static Error LastNameRequired =>
        Error.Validation("Employee.LastName.Required", "Last name is required.");

    public static Error RoleInvalid =>
        Error.Validation("Employee.Role.Invalid", "Invalid role assigned to employee.");

    public static Error NotFound(Guid id) =>
        Error.NotFound("BusinessOwner.NotFound", $"No business owner found with ID: {id}");

    public static Error NotOwner(Guid id) =>
        Error.Unauthorized("BusinessOwner.NotOwner", $"User is not the owner of business owner with ID: {id}");
}