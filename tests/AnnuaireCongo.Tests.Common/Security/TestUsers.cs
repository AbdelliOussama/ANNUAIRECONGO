namespace AnnuaireCongo.Tests.Common.Security;
public static class TestUsers
{
    public static AppUser Admin => new()
    {
        Id = "19a59129-6c20-417a-834d-11a208d32d96",
        Email = "Admin@localhost",
        UserName = "Admin@localhost",
        EmailConfirmed = true
    };
    public static AppUser BusinessOwner = new()
    {
        Id = "b6327240-0aea-46fc-863a-777fc4e42560",
        Email = "john.businessOwner@localhost",
        UserName = "john.businessOwner@localhost",
        EmailConfirmed = true
    };
}