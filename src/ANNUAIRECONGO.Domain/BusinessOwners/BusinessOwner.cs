using ANNUAIRECONGO.Domain.Common;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Companies;
using ANNUAIRECONGO.Domain.Identity;

namespace ANNUAIRECONGO.Domain.BusinessOwners;

public sealed class BusinessOwner : AuditableEntity
{
    public string FirstName { get; private set; } = string.Empty;
    public string LastName { get; private set; } = string.Empty;
    public string FullName => $"{FirstName} {LastName}";
    public Role Role { get; private set; }
    public string Email { get; private set; } = string.Empty;
    public string Phone { get; private set; } = string.Empty;
    public string? CompanyPosition { get; private set; }
    public bool IsVerified { get; private set; } = default; // KYC verification
    private readonly List<Company> _companies = new List<Company>();
    public IReadOnlyCollection<Company> Companies => _companies.AsReadOnly();

    private BusinessOwner()
    {
    }
    private BusinessOwner(Guid id,string firstName, string lastName, string email, string phone, string? companyPosition, Role role) : base(id)
    {
        FirstName = firstName;
        LastName = lastName;
        Email = email;
        Phone = phone;
        CompanyPosition = companyPosition;
        Role = role;
    }

    public static Result<BusinessOwner> Create(Guid id,string firstName, string lastName, string email, string phone, string? companyPosition, Role role)
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
        if(string.IsNullOrWhiteSpace(email))
        {
            return BusinessOwnerErrors.EmailRequired;
        }
        return new BusinessOwner(id,firstName, lastName, email, phone, companyPosition, role);
    }
    public Result<Updated> UpdateProfile(string firstName, string lastName, string phone, string? companyPosition)
    {
        if(string.IsNullOrWhiteSpace(firstName))
        {
            return BusinessOwnerErrors.FirstNameRequired;
        }
        if(string.IsNullOrWhiteSpace(lastName))
        {
            return BusinessOwnerErrors.LastNameRequired;
        }
        FirstName = firstName;
        LastName = lastName;
        Phone = phone;
        CompanyPosition = companyPosition;
        return Result.Updated;
    }
}
