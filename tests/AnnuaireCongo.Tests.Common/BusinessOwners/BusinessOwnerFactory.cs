using ANNUAIRECONGO.Domain.BusinessOwners;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Identity;

namespace ANNUAIRECONGO.AnnuaireCongo.Tests.Common.BusinessOwners;

public static class BusinessOwnerFactory
{
    public static Result<BusinessOwner> CreateBusinessOwner(
        Guid? id = null,
        string?FirstName = null,
        string? LastName = null,
        Role? role = null,
        string? email = null,
        string? phone = null,
        string? companyPosition = null
    )
    {
        return BusinessOwner.Create(
            id ?? Guid.NewGuid(),
            FirstName ?? "John",
            LastName ?? "Doe",
            email ?? "john.doe@example.com",
            phone ?? "555-1234",
            companyPosition ?? "Buisness Owner",
            role ?? Role.EntrepriseOwner
        );
    }
}