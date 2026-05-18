using ANNUAIRECONGO.Application.Features.Companies.Commands.CreateCompany;

namespace AnnuaireCongo.Application.UnitTests.Behaviours;

public static class CompanyCommandFactory
{
    public static CreateCompanyCommand CreateCreateCompanyCommand(string? name = null, Guid? cityId = null, IEnumerable<Guid>? sectorIds = null, string? description = null, string? address = null, decimal? latitude = null, decimal? longitude = null, string? rccm = null, string? niu = null, int? yearFounded = null, string? logoUrl = null, string? coverUrl = null)
    {
        return new CreateCompanyCommand(
            Name: name ?? "Company Name",
            CityId: cityId ?? Guid.NewGuid(),
            SectorIds: sectorIds ?? [Guid.NewGuid()],
            Description: description ?? "Company Description",
            Address: address ?? "Company Address",
            Latitude: latitude ?? 0,
            Longitude: longitude ?? 0,
            Rccm: rccm ?? "RCCM123456",
            Niu: niu ?? "NIU123456",
            YearFounded: yearFounded ?? 2023,
            LogoUrl: logoUrl ?? "https://storage.annuairetest.cg/images/company-photo-1.jpg",
            CoverUrl: coverUrl ?? "https://storage.annuairetest.cg/images/company-cover-1.jpg"
        );
    }
}

