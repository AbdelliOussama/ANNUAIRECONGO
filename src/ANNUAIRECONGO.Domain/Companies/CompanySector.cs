
using ANNUAIRECONGO.Domain.Common;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Sectors;

namespace ANNUAIRECONGO.Domain.Companies;

public class CompanySector : Entity
{
    public Guid CompanyId { get; private set; }
    public Guid SectorId { get; private set; }

    public Sector Sector { get; private set; } = null!;

    private CompanySector() { }

    private CompanySector(Guid companyId, Guid sectorId)
    {
        CompanyId = companyId;
        SectorId = sectorId;
    }

    public static Result<CompanySector> Create(Guid companyId, Guid sectorId)
    {
        return new CompanySector
        {
            CompanyId = companyId,
            SectorId = sectorId
        };
    }
}
