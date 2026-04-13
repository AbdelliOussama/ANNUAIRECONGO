using ANNUAIRECONGO.Domain.Companies.Enums;

namespace ANNUAIRECONGO.Application.Features.Companies.Dtos;

public class ContactDto
{
    public Guid Id { get; set; }
    public Guid CompanyId { get; set; }
    public ContactType Type { get; set; }
    public string Value { get; set; } = string.Empty;
    public bool IsPrimary { get; set; }
}
