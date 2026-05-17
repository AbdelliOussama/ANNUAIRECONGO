using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Sectors;

namespace AnnuaireCongo.Tests.Common.Sectors;

public static class SectorFactory
{
    public static Result<Sector> CreateSector(
        Guid? id = null,
        string? name = null,
        string? description = null,
        string? iconUrl = null,
        string? slug = null)
    {
        return Sector.Create(
            id ?? Guid.NewGuid(),
            name ?? "Maritime & Portuaire",
            description ?? "Port de Pointe-Noire, compagnies maritimes, services portuaires.",
            iconUrl ?? "directions_boat",
            slug ?? "maritime"
        );
    }
}
