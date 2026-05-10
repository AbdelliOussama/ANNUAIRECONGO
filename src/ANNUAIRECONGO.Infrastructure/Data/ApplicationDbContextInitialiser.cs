using ANNUAIRECONGO.Infrastructure.Identity;
using ANNUAIRECONGO.Domain.BusinessOwners;
using ANNUAIRECONGO.Domain.Geography;
using ANNUAIRECONGO.Domain.Identity;
using ANNUAIRECONGO.Domain.Sectors;
using ANNUAIRECONGO.Infrastructure.Data.Seeding;
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
            await _context.Database.MigrateAsync();
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

        // Admin Users
        var admins = new List<(string Id, string Email)>
        {
            ("19a59129-6c20-417a-834d-11a208d32d96", "admin@localhost"),
            (Guid.NewGuid().ToString(), "superadmin@localhost"),
            (Guid.NewGuid().ToString(), "support@localhost")
        };

        foreach (var a in admins)
        {
            if (_userManager.Users.All(u => u.Email != a.Email))
            {
                var user = new AppUser { Id = a.Id, Email = a.Email, UserName = a.Email, EmailConfirmed = true };
                await _userManager.CreateAsync(user, a.Email); // Using email as password for simplicity in dev
                if (!string.IsNullOrWhiteSpace(AdminRole.Name))
                {
                    await _userManager.AddToRolesAsync(user, [AdminRole.Name]);
                }
            }
        }

        // Business Owner Users
        var businessOwnersData = new List<(string Id, string Email, string FirstName, string LastName)>
        {
            ("b6327240-0aea-46fc-863a-777fc4e42560", "john.businessOwner@localhost", "John", "Doe"),
            ("8104ab20-26c2-4651-b1de-c0baf04dbbd9", "peter.businessOwner@localhost", "Peter", "Smith"),
            ("e17c83de-1089-4f19-bf79-5f789133d37f", "kevin.businessOwner@localhost", "Kevin", "Brown"),
            ("54cd01ba-b9ae-4c14-bab6-f3df0219ba4c", "suzan.businessOwner@localhost", "Suzan", "White"),
            (Guid.NewGuid().ToString(), "michel.moukouri@localhost", "Michel", "Moukouri"),
            (Guid.NewGuid().ToString(), "alain.ngoma@localhost", "Alain", "Ngoma"),
            (Guid.NewGuid().ToString(), "sylvie.kimbangou@localhost", "Sylvie", "Kimbangou"),
            (Guid.NewGuid().ToString(), "patrick.obambi@localhost", "Patrick", "Obambi"),
            (Guid.NewGuid().ToString(), "chantal.ebina@localhost", "Chantal", "Ebina"),
            (Guid.NewGuid().ToString(), "jean.malonga@localhost", "Jean", "Malonga"),
            (Guid.NewGuid().ToString(), "marie.moussavou@localhost", "Marie", "Moussavou")
        };

        var newBusinessOwners = new List<BusinessOwner>();

        foreach (var bo in businessOwnersData)
        {
            if (_userManager.Users.All(u => u.Email != bo.Email))
            {
                var user = new AppUser { Id = bo.Id, Email = bo.Email, UserName = bo.Email, EmailConfirmed = true };
                await _userManager.CreateAsync(user, "Password123!"); // Secure password for business owners
                if (!string.IsNullOrWhiteSpace(BusinessOwnerRole.Name))
                {
                    await _userManager.AddToRolesAsync(user, [BusinessOwnerRole.Name]);
                }
                
                // Add to list to create domain entities
                newBusinessOwners.Add(BusinessOwner.Create(Guid.Parse(bo.Id), bo.FirstName, bo.LastName, "06" + new Random().Next(10000000, 99999999).ToString(), "Directeur", Role.EntrepriseOwner).Value);
            }
        }

        if (newBusinessOwners.Any())
        {
            _context.BusinessOwners.AddRange(newBusinessOwners);
            await _context.SaveChangesAsync();
        }

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
                Sector.Create(Guid.NewGuid(), "Agriculture", "Agriculture, élevage et pêche").Value,
                Sector.Create(Guid.NewGuid(), "Commerce", "Vente en gros, détail et e-commerce").Value,
                Sector.Create(Guid.NewGuid(), "Énergie", "Pétrole, gaz et énergies renouvelables").Value,
                Sector.Create(Guid.NewGuid(), "Finances", "Banques, assurances et micro-finances").Value,
                Sector.Create(Guid.NewGuid(), "Santé", "Hôpitaux, cliniques, et pharmacies").Value,
                Sector.Create(Guid.NewGuid(), "Technologies", "Informatique, télécoms et startups").Value,
                Sector.Create(Guid.NewGuid(), "Transport", "Transport terrestre, aérien, et logistique").Value,
                Sector.Create(Guid.NewGuid(), "Tourisme", "Hôtellerie, restauration et agences de voyage").Value
            ]);
            await _context.SaveChangesAsync();
        }

         // Seed plans
        await PlanSeeder.SeedPlansAsync(_context);

        // Seed companies, subscriptions, payments, and notifications
        await CompanySeeder.SeedCompaniesAsync(_context, _userManager, _logger);

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
