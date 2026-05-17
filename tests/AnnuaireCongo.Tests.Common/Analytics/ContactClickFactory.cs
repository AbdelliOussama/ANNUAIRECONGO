using ANNUAIRECONGO.Domain.Analytics;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Companies.Enums;

namespace AnnuaireCongo.Tests.Common.Analytics;

public static class ContactClickFactory
{
    public static Result<ContactClick> CreateContactClick(
        Guid? companyId = null,
        ContactType? contactType = null)
    {
        return ContactClick.Create(
            companyId ?? Guid.NewGuid(),
            contactType ?? ContactType.Phone
        );
    }
}
