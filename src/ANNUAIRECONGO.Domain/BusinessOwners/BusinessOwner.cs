using ANNUAIRECONGO.Domain.Common;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Companies;
using ANNUAIRECONGO.Domain.Identity;

namespace ANNUAIRECONGO.Domain.BusinessOwners;

public sealed class BusinessOwner : AuditableEntity
{
    public string FirstName { get; }
    public string LastName { get; }
    public string FullName => $"{FirstName} {LastName}";
    public Role Role { get; }
    public string Phone { get; private set; }
    public string? CompanyPosition { get; private set; }
    public bool IsVerified { get; private set; } = default; // KYC verification
    private readonly List<Company> _companies = new List<Company>();
    public IReadOnlyCollection<Company> Companies => _companies.AsReadOnly();

    private BusinessOwner()
    {
    }
    private BusinessOwner(Guid id,string firstName, string lastName, string phone, string? companyPosition, Role role) : base(id)
    {
        FirstName = firstName;
        LastName = lastName;
        Phone = phone;
        CompanyPosition = companyPosition;
        Role = role;
    }

    public static Result<BusinessOwner> Create(Guid id,string firstName, string lastName, string phone, string? companyPosition, Role role)
    {
        if(id == Guid.Empty)
        {
            return BusinessOwnerErrors.IdRequired;
        }
        if(string.IsNullOrWhiteSpace(firstName))
        {
            return BusinessOwnerErrors.FirstNameRequired;
        }
        if(string.IsNullOrWhiteSpace(lastName))
        {
            return BusinessOwnerErrors.LastNameRequired;
        }
        if(role == null)
        {
            return BusinessOwnerErrors.RoleInvalid;
        }
        return new BusinessOwner(id,firstName, lastName, phone, companyPosition, role);
    }
}