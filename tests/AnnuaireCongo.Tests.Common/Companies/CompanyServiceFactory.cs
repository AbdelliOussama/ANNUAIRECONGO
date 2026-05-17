using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Companies;

namespace AnnuaireCongo.Tests.Common.Companies;

public static class CompanyServiceFactory
{
    public static Result<CompanyService> CreateCompanyService(
        Guid? id = null,
        Guid? companyId = null,
        string? title = null,
        string? description = null)
    {
        return CompanyService.Create(
            id ?? Guid.NewGuid(),
            companyId ?? Guid.NewGuid(),
            title ?? "Transport maritime international",
            description ?? "Service de fret maritime entre Pointe-Noire et les ports européens."
        );
    }
}
