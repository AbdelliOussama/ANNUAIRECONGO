namespace ANNUAIRECONGO.Application.Common.Interfaces;

public interface IUser
{
    string? Id { get; }

    /// <summary>
    /// Returns true if the current user has been assigned the specified role.
    /// Mirrors ClaimsPrincipal.IsInRole so the Application layer can make
    /// role-based decisions without taking a dependency on HttpContext.
    /// </summary>
    bool IsInRole(string role);
}
