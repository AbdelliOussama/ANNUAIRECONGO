using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Companies;

namespace AnnuaireCongo.Tests.Common.Companies;

public static class CompanySectorFactory
{
    public static Result<CompanySector> CreateCompanySector(
        Guid? companyId = null,
        Guid? sectorId = null)
    {
        return CompanySector.Create(
            companyId ?? Guid.NewGuid(),
            sectorId ?? Guid.NewGuid()
        );
    }
}
