using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Companies;

namespace AnnuaireCongo.Tests.Common.Companies;

public static class CompanyFactory
{
    public static Result<Company> CreateCompany(
        Guid? id = null,
        Guid? ownerId = null,
        string? name = null,
        Guid? cityId = null,
        string? description = null,
        string? address = null,
        decimal? latitude = null,
        decimal? longitude = null,
        IEnumerable<Guid>? sectorIds = null,
        string? rccm = null,
        string? niu = null,
        int? yearFounded = null,
        bool isVerified = false,
        bool isPremium = false)
    {
        return Company.Create(
            id ?? Guid.NewGuid(),
            ownerId ?? Guid.NewGuid(),
            name ?? "Entreprise Test SARL",
            cityId ?? Guid.NewGuid(),
            description ?? "Une entreprise de test fiable et réputée.",
            address ?? "123 Avenue de la Liberté",
            latitude ?? -4.2699m,
            longitude ?? 15.2714m,
            sectorIds ?? [Guid.NewGuid()],
            rccm ?? "CG-BZV-01-2024-B12-00001",
            niu ?? "M2024123456789",
            yearFounded ?? 2020,
            isVerified,
            isPremium
        );
    }
}
