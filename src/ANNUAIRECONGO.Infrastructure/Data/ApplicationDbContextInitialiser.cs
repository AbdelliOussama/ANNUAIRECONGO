using AnnuaireCongo.Infrastructure.Identity;
using ANNUAIRECONGO.Domain.BusinessOwners;
using ANNUAIRECONGO.Domain.Geography;
using ANNUAIRECONGO.Domain.Identity;
using ANNUAIRECONGO.Domain.Sectors;
using ANNUAIRECONGO.Infrastructure.Identity;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Infrastructure.Data;

public class ApplicationDbContextInitialiser(
    ILogger<ApplicationDbContextInitialiser> logger,
    AppDbContext context, UserManager<AppUser> userManager,
    RoleManager<IdentityRole> roleManager)
{
    private readonly ILogger<ApplicationDbContextInitialiser> _logger = logger;
    private readonly AppDbContext _context = context;
    private readonly UserManager<AppUser> _userManager = userManager;
    private readonly RoleManager<IdentityRole> _roleManager = roleManager;

    public async Task InitialiseAsync()
    {
        try
        {
            await _context.Database.EnsureCreatedAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while initialising the database.");
            throw;
        }
    }

    public async Task SeedAsync()
    {
        try
        {
            await TrySeedAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while seeding the database.");
            throw;
        }
    }

    public async Task TrySeedAsync()
    {
        // Default roles
        var AdminRole = new IdentityRole(nameof(Role.Admin));

        if (_roleManager.Roles.All(r => r.Name != AdminRole.Name))
        {
            await _roleManager.CreateAsync(AdminRole);
        }

        var BusinessOwnerRole = new IdentityRole(nameof(Role.EntrepriseOwner));

        if (_roleManager.Roles.All(r => r.Name != BusinessOwnerRole.Name))
        {
            await _roleManager.CreateAsync(BusinessOwnerRole);
        }

        // Default users
        var Admin = new AppUser
        {
            Id = "19a59129-6c20-417a-834d-11a208d32d96",
            Email = "Admin@localhost",
            UserName = "Admin@localhost",
            EmailConfirmed = true
        };

        if (_userManager.Users.All(u => u.Email != Admin.Email))
        {
            await _userManager.CreateAsync(Admin, Admin.Email);

            if (!string.IsNullOrWhiteSpace(AdminRole.Name))
            {
                await _userManager.AddToRolesAsync(Admin, [AdminRole.Name]);
            }
        }

        var BusinessOwner1 = new AppUser
        {
            Id = "b6327240-0aea-46fc-863a-777fc4e42560",
            Email = "john.businessOwner@localhost",
            UserName = "john.businessOwner@localhost",
            EmailConfirmed = true
        };

        if (_userManager.Users.All(u => u.Email != BusinessOwner1.Email))
        {
            await _userManager.CreateAsync(BusinessOwner1, BusinessOwner1.Email);

            if (!string.IsNullOrWhiteSpace(BusinessOwnerRole.Name))
            {
                await _userManager.AddToRolesAsync(BusinessOwner1, [BusinessOwnerRole.Name]);
            }
        }

        var BusinessOwner2 = new AppUser
        {
            Id = "8104ab20-26c2-4651-b1de-c0baf04dbbd9",
            Email = "peter.businessOwner@localhost",
            UserName = "peter.businessOwner@localhost",
            EmailConfirmed = true
        };

        if (_userManager.Users.All(u => u.Email != BusinessOwner2.Email))
        {
            await _userManager.CreateAsync(BusinessOwner2, BusinessOwner2.Email);

            if (!string.IsNullOrWhiteSpace(BusinessOwnerRole.Name))
            {
                await _userManager.AddToRolesAsync(BusinessOwner2, [BusinessOwnerRole.Name]);
            }
        }

        var BusinessOwner3 = new AppUser
        {
            Id = "e17c83de-1089-4f19-bf79-5f789133d37f",
            Email = "kevin.businessOwner@localhost",
            UserName = "kevin.businessOwner@localhost",
            EmailConfirmed = true
        };

        if (_userManager.Users.All(u => u.Email != BusinessOwner3.Email))
        {
            await _userManager.CreateAsync(BusinessOwner3, BusinessOwner3.Email);

            if (!string.IsNullOrWhiteSpace(BusinessOwnerRole.Name))
            {
                await _userManager.AddToRolesAsync(BusinessOwner3, [BusinessOwnerRole.Name]);
            }
        }

        var BusinessOwner4 = new AppUser
        {
            Id = "54cd01ba-b9ae-4c14-bab6-f3df0219ba4c",
            Email = "suzan.businessOwner@localhost",
            UserName = "suzan.businessOwner@localhost",
            EmailConfirmed = true
        };

        if (_userManager.Users.All(u => u.Email != BusinessOwner4.Email))
        {
            await _userManager.CreateAsync(BusinessOwner4, BusinessOwner4.Email);

            if (!string.IsNullOrWhiteSpace(BusinessOwnerRole.Name))
            {
                await _userManager.AddToRolesAsync(BusinessOwner4, [BusinessOwnerRole.Name]);
            }
        }

        if (!_context.BusinessOwners.Any())
        {
            _context.BusinessOwners.AddRange(
            [
                BusinessOwner.Create(Guid.Parse(BusinessOwner1.Id), "John", "Doe", "1234567890", "CEO", Role.EntrepriseOwner).Value,
                BusinessOwner.Create(Guid.Parse(BusinessOwner2.Id), "Peter", "Doe", "1234567890", "CEO", Role.EntrepriseOwner).Value,
                BusinessOwner.Create(Guid.Parse(BusinessOwner3.Id), "Kevin", "Doe", "1234567890", "CEO", Role.EntrepriseOwner).Value,
                BusinessOwner.Create(Guid.Parse(BusinessOwner4.Id), "Suzan", "Doe", "1234567890", "CEO", Role.EntrepriseOwner).Value
            ]);
        }
        await _context.SaveChangesAsync();

        if (!_context.Regions.Any())
        {
            var brazzaville = Region.Create(Guid.NewGuid(), "Brazzaville").Value;
            var pointeNoire = Region.Create(Guid.NewGuid(), "Pointe-Noire").Value;
            var kouilou = Region.Create(Guid.NewGuid(), "Kouilou").Value;
            var niari = Region.Create(Guid.NewGuid(), "Niari").Value;
            var bouenza = Region.Create(Guid.NewGuid(), "Bouenza").Value;
            var lekoumou = Region.Create(Guid.NewGuid(), "Lékoumou").Value;
            var pool = Region.Create(Guid.NewGuid(), "Pool").Value;
            var plateaux = Region.Create(Guid.NewGuid(), "Plateaux").Value;
            var cuvette = Region.Create(Guid.NewGuid(), "Cuvette").Value;
            var cuvetteOuest = Region.Create(Guid.NewGuid(), "Cuvette-Ouest").Value;
            var sangha = Region.Create(Guid.NewGuid(), "Sangha").Value;
            var likouala = Region.Create(Guid.NewGuid(), "Likouala").Value;

            _context.Regions.AddRange(
            [
                brazzaville, pointeNoire, kouilou, niari, bouenza,
                lekoumou, pool, plateaux, cuvette, cuvetteOuest,
                sangha, likouala
            ]);
            await _context.SaveChangesAsync();

            if (!_context.Cities.Any())
            {
                _context.Cities.AddRange(
                [
                    // Brazzaville (capital + communes)
                    City.Create(Guid.NewGuid(), brazzaville.Id, "Brazzaville").Value,
                    City.Create(Guid.NewGuid(), brazzaville.Id, "Makélékélé").Value,
                    City.Create(Guid.NewGuid(), brazzaville.Id, "Bacongo").Value,
                    City.Create(Guid.NewGuid(), brazzaville.Id, "Poto-Poto").Value,
                    City.Create(Guid.NewGuid(), brazzaville.Id, "Moungali").Value,
                    City.Create(Guid.NewGuid(), brazzaville.Id, "Talangaï").Value,
                    City.Create(Guid.NewGuid(), brazzaville.Id, "Mfilou").Value,
                    City.Create(Guid.NewGuid(), brazzaville.Id, "Djiri").Value,

                    // Pointe-Noire
                    City.Create(Guid.NewGuid(), pointeNoire.Id, "Pointe-Noire").Value,
                    City.Create(Guid.NewGuid(), pointeNoire.Id, "Lumumba").Value,
                    City.Create(Guid.NewGuid(), pointeNoire.Id, "Tié-Tié").Value,
                    City.Create(Guid.NewGuid(), pointeNoire.Id, "Mongo-Mpoukou").Value,
                    City.Create(Guid.NewGuid(), pointeNoire.Id, "Ngoyo").Value,

                    // Kouilou
                    City.Create(Guid.NewGuid(), kouilou.Id, "Loango").Value,
                    City.Create(Guid.NewGuid(), kouilou.Id, "Madingo-Kayes").Value,

                    // Niari
                    City.Create(Guid.NewGuid(), niari.Id, "Dolisie").Value,
                    City.Create(Guid.NewGuid(), niari.Id, "Mossendjo").Value,
                    City.Create(Guid.NewGuid(), niari.Id, "Loudima").Value,

                    // Bouenza
                    City.Create(Guid.NewGuid(), bouenza.Id, "Nkayi").Value,
                    City.Create(Guid.NewGuid(), bouenza.Id, "Madingou").Value,
                    City.Create(Guid.NewGuid(), bouenza.Id, "Kayes").Value,

                    // Lékoumou
                    City.Create(Guid.NewGuid(), lekoumou.Id, "Sibiti").Value,
                    City.Create(Guid.NewGuid(), lekoumou.Id, "Zanaga").Value,

                    // Pool
                    City.Create(Guid.NewGuid(), pool.Id, "Kinkala").Value,
                    City.Create(Guid.NewGuid(), pool.Id, "Mindouli").Value,

                    // Plateaux
                    City.Create(Guid.NewGuid(), plateaux.Id, "Djambala").Value,
                    City.Create(Guid.NewGuid(), plateaux.Id, "Gamboma").Value,

                    // Cuvette
                    City.Create(Guid.NewGuid(), cuvette.Id, "Owando").Value,
                    City.Create(Guid.NewGuid(), cuvette.Id, "Oyo").Value,
                    City.Create(Guid.NewGuid(), cuvette.Id, "Makoua").Value,

                    // Cuvette-Ouest
                    City.Create(Guid.NewGuid(), cuvetteOuest.Id, "Ewo").Value,
                    City.Create(Guid.NewGuid(), cuvetteOuest.Id, "Kellé").Value,

                    // Sangha
                    City.Create(Guid.NewGuid(), sangha.Id, "Ouesso").Value,
                    City.Create(Guid.NewGuid(), sangha.Id, "Pokola").Value,

                    // Likouala
                    City.Create(Guid.NewGuid(), likouala.Id, "Impfondo").Value,
                    City.Create(Guid.NewGuid(), likouala.Id, "Dongou").Value
                ]);
            }
            await _context.SaveChangesAsync();
        }

        if (!_context.Sectors.Any())
        {
            _context.Sectors.AddRange(
            [
                Sector.Create(Guid.NewGuid(), "Technology", "Technology and software development companies").Value,
                Sector.Create(Guid.NewGuid(), "Finance", "Banking, insurance, and financial services").Value,
                Sector.Create(Guid.NewGuid(), "Healthcare", "Hospitals, clinics, and healthcare providers").Value,
                Sector.Create(Guid.NewGuid(), "Education", "Schools, universities, and educational institutions").Value,
                Sector.Create(Guid.NewGuid(), "Retail", "Retail stores and e-commerce businesses").Value,
                Sector.Create(Guid.NewGuid(), "Construction", "Construction companies and real estate").Value,
                Sector.Create(Guid.NewGuid(), "Energy", "Oil, gas, and renewable energy companies").Value,
                Sector.Create(Guid.NewGuid(), "Telecommunications", "Telecom providers and internet services").Value,
                Sector.Create(Guid.NewGuid(), "Agriculture", "Agriculture and agro-industry").Value,
                Sector.Create(Guid.NewGuid(), "Tourism", "Hotels, restaurants, and tourism services").Value,
                Sector.Create(Guid.NewGuid(), "Transport", "Transportation and logistics companies").Value,
                Sector.Create(Guid.NewGuid(), "Food", "Food processing and beverage companies").Value,
                Sector.Create(Guid.NewGuid(), "Media", "Media, advertising, and entertainment").Value,
                Sector.Create(Guid.NewGuid(), "Consulting", "Consulting and professional services").Value,
                Sector.Create(Guid.NewGuid(), "Manufacturing", "Manufacturing and industrial production").Value
            ]);
            await _context.SaveChangesAsync();
        }
        await _context.SaveChangesAsync();
    }
}

// Moved to namespace level to fix nested static class issue
public static class InitialiserExtensions
{
    public static async Task InitialiseDatabaseAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();

        var initialiser = scope.ServiceProvider.GetRequiredService<ApplicationDbContextInitialiser>();

        await initialiser.InitialiseAsync();

        await initialiser.SeedAsync();
    }
}