using ANNUAIRECONGO.Infrastructure.Identity;

namespace   AnnuaireCongo.Tests.Common.Security;

internal class UserFactory
{
    public static AppUser CreateUser()
    {
        return new AppUser
        {
            Id = "145dff4-9c8b-4e5a-9c8b-4e5a9c8b4e5a",
            UserName = "testuser",
            Email = "testuser@example.com",
            EmailConfirmed = true,
        };
    }
}