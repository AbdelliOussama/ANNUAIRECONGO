using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Infrastructure.Identity;

namespace AnnuaireCongo.Tests.Common.Security;

public class TestCurrentUser  : IUser
{
    private AppUser? _currentUser;

    public string? Id => _currentUser!.Id?? UserFactory.CreateUser().Id;

    public void Returns(AppUser? user)
    {
        _currentUser = user;
    }
}