using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Infrastructure.Identity;

namespace AnnuaireCongo.Tests.Common.Security;

public class TestCurrentUser : IUser
{
    private AppUser? _currentUser;
    private readonly HashSet<string> _roles = [];

    public string? Id => _currentUser!.Id ?? UserFactory.CreateUser().Id;

    /// <summary>
    /// Returns true when the test has been configured with the given role via AsRole().
    /// </summary>
    public bool IsInRole(string role) => _roles.Contains(role, StringComparer.OrdinalIgnoreCase);

    public void Returns(AppUser? user)
    {
        _currentUser = user;
    }

    /// <summary>
    /// Configures the test user to appear as a member of the specified role.
    /// Call before executing the handler under test.
    /// </summary>
    public void AsRole(string role) => _roles.Add(role);

    /// <summary>
    /// Removes all previously configured roles.
    /// </summary>
    public void ClearRoles() => _roles.Clear();
}