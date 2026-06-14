using ANNUAIRECONGO.Domain.Common;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.UserSubscriptions;

namespace ANNUAIRECONGO.Domain.UserProfiles;

/// <summary>
/// Profile for a <see cref="Identity.Role.RegularUser"/> — a user who is not a business owner
/// but may purchase a plan to access legal documents on company fiches.
/// </summary>
public sealed class UserProfile : AuditableEntity
{
    public string  FirstName { get; private set; } = string.Empty;
    public string  LastName  { get; private set; } = string.Empty;
    public string  FullName  => $"{FirstName} {LastName}";
    public string  Email     { get; private set; } = string.Empty;
    /// <summary>Optional — may be null if the user did not supply a phone number.</summary>
    public string? Phone     { get; private set; }

    private readonly List<UserSubscription> _subscriptions = [];
    public IReadOnlyCollection<UserSubscription> Subscriptions => _subscriptions.AsReadOnly();

    private UserProfile() { }

    private UserProfile(Guid id, string firstName, string lastName, string email, string? phone)
        : base(id)
    {
        FirstName = firstName;
        LastName  = lastName;
        Email     = email;
        Phone     = phone;
    }

    // ── Factory ───────────────────────────────────────────────────

    public static Result<UserProfile> Create(
        Guid    id,
        string  firstName,
        string  lastName,
        string  email,
        string? phone = null)
    {
        if (id == Guid.Empty)
            return UserProfileErrors.IdRequired;
        if (string.IsNullOrWhiteSpace(firstName))
            return UserProfileErrors.FirstNameRequired;
        if (string.IsNullOrWhiteSpace(lastName))
            return UserProfileErrors.LastNameRequired;
        if (string.IsNullOrWhiteSpace(email))
            return UserProfileErrors.EmailRequired;

        return new UserProfile(id, firstName, lastName, email, phone);
    }

    // ── Behaviour ─────────────────────────────────────────────────

    public Result<Updated> UpdateProfile(string firstName, string lastName, string? phone)
    {
        if (string.IsNullOrWhiteSpace(firstName))
            return UserProfileErrors.FirstNameRequired;
        if (string.IsNullOrWhiteSpace(lastName))
            return UserProfileErrors.LastNameRequired;

        FirstName = firstName;
        LastName  = lastName;
        Phone     = phone;
        return Result.Updated;
    }
}
