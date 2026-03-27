using System.ComponentModel.DataAnnotations;
using ANNUAIRECONGO.Contracts.Common;

namespace ANNUAIRECONGO.Contracts.Requests.Companies.Contacts;

public  class UpdateContactRequest
{
    [Required(ErrorMessage = "ContactId is required")]
    public Guid ContactId { get; set; } = Guid.Empty;
    [Required(ErrorMessage = "Type is required")]
    public ContactType Type { get; set; }
    [Required(ErrorMessage = "Value is required")]
    public string Value { get; set; } = string.Empty;
    public bool IsPrimary { get; set;} = true;
}