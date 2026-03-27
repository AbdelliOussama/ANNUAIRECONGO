

using ANNUAIRECONGO.Domain.Common;
using ANNUAIRECONGO.Domain.Companies;
using ANNUAIRECONGO.Domain.Companies.Enums;

namespace ANNUAIRECONGO.Domain.Analytics;

public class ContactClick : Entity
{
    public Guid CompanyId { get; private set; }
    public ContactType ContactType { get; private set; }
    public DateTime ClickedAt { get; private set; }
    public Company Company { get; private set; } = null!;


    private ContactClick() { }

    public static ContactClick Create(Guid companyId, ContactType contactType)
    {
        return new ContactClick
        {
            CompanyId = companyId,
            ContactType = contactType,
            ClickedAt = DateTime.UtcNow
        };
    }
}
