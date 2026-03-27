
using ANNUAIRECONGO.Domain.Common;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Companies.Enums;

namespace ANNUAIRECONGO.Domain.Companies;


public class CompanyContact : Entity
{
    public Guid CompanyId { get; private set; }
    public ContactType Type { get; private set; }
    public string Value { get; private set; } = string.Empty;
    public bool IsPrimary { get; private set; }

    private CompanyContact() { }
    private CompanyContact(Guid companyId, ContactType type, string value, bool isPrimary)
    {
        CompanyId = companyId;
        Type = type;
        Value = value;
        IsPrimary = isPrimary;
    }

    public static Result<CompanyContact> Create(
        Guid companyId,
        ContactType type,
        string value,
        bool isPrimary = false)
    {
        return new CompanyContact(companyId, type, value, isPrimary);
    }

    public Result<Updated>Update(ContactType type, string value, bool isPrimary)
    {
        Type = type;
        Value = value;
        IsPrimary = isPrimary;
        return Result.Updated;

    }
}
