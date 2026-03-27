using ANNUAIRECONGO.Contracts.Common;

namespace ANNUAIRECONGO.Contracts.Requests.Companies.Contacts;
public class AddContactRequest
{
    public ContactType Type { get; set; }
    public string Value { get; set; } = string.Empty;
    public bool IsPrimary { get; set;} = true;

}