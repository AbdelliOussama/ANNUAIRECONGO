using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Companies;
using ANNUAIRECONGO.Domain.Companies.Enums;

namespace AnnuaireCongo.Tests.Common.Companies;

public static class CompanyContactFactory
{
    public static Result<CompanyContact> CreateCompanyContact(
        Guid? companyId = null,
        ContactType? type = null,
        string? value = null,
        bool isPrimary = true)
    {
        return CompanyContact.Create(
            companyId ?? Guid.NewGuid(),
            type ?? ContactType.Phone,
            value ?? "+242 06 500 0000",
            isPrimary
        );
    }
}
