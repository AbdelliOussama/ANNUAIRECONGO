using ANNUAIRECONGO.Domain.BusinessOwners;
using ANNUAIRECONGO.Domain.Companies;
using ANNUAIRECONGO.Domain.Companies.Enums;
using ANNUAIRECONGO.Domain.Geography;
using ANNUAIRECONGO.Domain.Identity;
using ANNUAIRECONGO.Domain.Notifications;
using ANNUAIRECONGO.Domain.Sectors;
using ANNUAIRECONGO.Domain.Subscriptions;
using ANNUAIRECONGO.Domain.Subscriptions.Payments;
using ANNUAIRECONGO.Domain.Subscriptions.Payments.Enums;
using ANNUAIRECONGO.Domain.Subscriptions.Plans.Enums;
using ANNUAIRECONGO.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Infrastructure.Data.Seeding;

public static class CompanySeeder
{
    public static async Task SeedCompaniesAsync(
        AppDbContext context, 
        UserManager<AppUser> userManager, 
        ILogger logger)
    {
        if (await context.Companies.AnyAsync())
        {
            logger.LogInformation("Companies already seeded.");
            return;
        }

        logger.LogInformation("Seeding companies...");

        var regions = await context.Regions.Include(r => r.Cities).ToListAsync();
        var cities = regions.SelectMany(r => r.Cities).ToList();
        var sectors = await context.Sectors.ToListAsync();
        var owners = await context.BusinessOwners.ToListAsync();
        var plans = await context.Plans.ToListAsync();

        if (!cities.Any() || !sectors.Any() || !owners.Any() || !plans.Any())
        {
            logger.LogWarning("Required lookup data (Cities, Sectors, Owners, Plans) missing. Cannot seed companies.");
            return;
        }

        var random = new Random();

        var brazzaville = cities.FirstOrDefault(c => c.Name == "Brazzaville") ?? cities.First();
        var pointeNoire = cities.FirstOrDefault(c => c.Name == "Pointe-Noire") ?? cities.Last();

        var techSector = sectors.FirstOrDefault(s => s.Name == "Technologies") ?? sectors.First();
        var energySector = sectors.FirstOrDefault(s => s.Name == "Énergie") ?? sectors.First();
        var telecompSector = sectors.FirstOrDefault(s => s.Name == "Technologies") ?? sectors.First();
        var financeSector = sectors.FirstOrDefault(s => s.Name == "Finances") ?? sectors.First();
        var healthSector = sectors.FirstOrDefault(s => s.Name == "Santé") ?? sectors.First();
        var tourismSector = sectors.FirstOrDefault(s => s.Name == "Tourisme") ?? sectors.First();
        var retailSector = sectors.FirstOrDefault(s => s.Name == "Commerce") ?? sectors.First();

        var premiumPlan = plans.FirstOrDefault(p => p.Name == PlanName.Premium) ?? plans.First();
        var enterprisePlan = plans.FirstOrDefault(p => p.Name == PlanName.Pro) ?? plans.Last();

        var companyDataList = new List<(string Name, string Desc, Guid CityId, Guid SectorId, Guid OwnerId, bool IsPremium, string Logo)>
        {
            ("MTN Congo", "Leader de la téléphonie mobile au Congo, offrant des services voix et internet de haute qualité.", brazzaville.Id, telecompSector.Id, owners[random.Next(owners.Count)].Id, true, "https://upload.wikimedia.org/wikipedia/commons/9/93/MTN_Logo.svg"),
            ("Airtel Congo", "Opérateur de télécommunications proposant des offres internet, mobile money et forfaits voix.", pointeNoire.Id, telecompSector.Id, owners[random.Next(owners.Count)].Id, true, "https://upload.wikimedia.org/wikipedia/commons/f/fb/Airtel_logo.svg"),
            ("TotalEnergies EP Congo", "Filiale du groupe TotalEnergies, spécialisée dans l'exploration et la production pétrolière.", pointeNoire.Id, energySector.Id, owners[random.Next(owners.Count)].Id, true, "https://upload.wikimedia.org/wikipedia/commons/8/86/TotalEnergies_logo.svg"),
            ("Eni Congo", "Acteur majeur de l'exploration pétrolière et gazière en République du Congo.", pointeNoire.Id, energySector.Id, owners[random.Next(owners.Count)].Id, true, "https://upload.wikimedia.org/wikipedia/commons/0/07/Eni_SpA.svg"),
            ("Brasco", "Brasseries du Congo, principal producteur et distributeur de boissons au Congo.", brazzaville.Id, retailSector.Id, owners[random.Next(owners.Count)].Id, false, "https://via.placeholder.com/150/ff0000/ffffff?text=Brasco"),
            ("Ecobank Congo", "Banque panafricaine offrant des services bancaires aux particuliers et entreprises.", brazzaville.Id, financeSector.Id, owners[random.Next(owners.Count)].Id, true, "https://via.placeholder.com/150/0033a0/ffffff?text=Ecobank"),
            ("Banque Commerciale Internationale (BCI)", "Banque de référence au Congo pour vos projets personnels et professionnels.", pointeNoire.Id, financeSector.Id, owners[random.Next(owners.Count)].Id, false, "https://via.placeholder.com/150/008000/ffffff?text=BCI"),
            ("Radisson Blu M'Bamou Palace Hotel", "Hôtel de luxe situé sur les rives du fleuve Congo à Brazzaville.", brazzaville.Id, tourismSector.Id, owners[random.Next(owners.Count)].Id, true, "https://via.placeholder.com/150/1e1e1e/ffffff?text=Radisson"),
            ("Clinique Securex", "Établissement médical de pointe offrant des soins de qualité à Brazzaville.", brazzaville.Id, healthSector.Id, owners[random.Next(owners.Count)].Id, false, "https://via.placeholder.com/150/ff0000/ffffff?text=Securex"),
            ("Société Nationale des Pétroles du Congo (SNPC)", "Entreprise nationale congolaise chargée de la valorisation des ressources pétrolières.", brazzaville.Id, energySector.Id, owners[random.Next(owners.Count)].Id, true, "https://via.placeholder.com/150/000000/ffffff?text=SNPC"),
            ("LCDE (La Congolaise des Eaux)", "Entreprise publique chargée de la distribution d'eau potable.", brazzaville.Id, energySector.Id, owners[random.Next(owners.Count)].Id, false, "https://via.placeholder.com/150/0000ff/ffffff?text=LCDE"),
            ("Énergie Électrique du Congo (E2C)", "Société de production, transport et distribution de l'électricité.", pointeNoire.Id, energySector.Id, owners[random.Next(owners.Count)].Id, false, "https://via.placeholder.com/150/ffff00/000000?text=E2C"),
            ("Maya-Maya Airport Services", "Services de gestion aéroportuaire et logistique au Congo.", brazzaville.Id, tourismSector.Id, owners[random.Next(owners.Count)].Id, false, "https://via.placeholder.com/150/808080/ffffff?text=Aero"),
            ("Congo Telecom", "L'opérateur historique des télécommunications en République du Congo.", brazzaville.Id, telecompSector.Id, owners[random.Next(owners.Count)].Id, true, "https://via.placeholder.com/150/0033cc/ffffff?text=CT"),
            ("Pétro Congo", "Réseau de stations-services et distribution de produits pétroliers.", pointeNoire.Id, energySector.Id, owners[random.Next(owners.Count)].Id, false, "https://via.placeholder.com/150/ff6600/ffffff?text=Petro")
        };

        var notifications = new List<Notification>();

        foreach (var data in companyDataList)
        {
            var companyId = Guid.NewGuid();
            var companyResult = Company.Create(
                companyId,
                data.OwnerId,
                data.Name,
                data.CityId,
                data.Desc,
                $"{new Random().Next(10, 500)} Avenue General de Gaulle",
                null,
                null,
                new List<Guid> { data.SectorId },
                "RCCM-" + new Random().Next(10000, 99999),
                "NIU" + new Random().Next(100000, 999999),
                new Random().Next(1960, 2020),
                data.IsPremium,
                data.IsPremium
            );

            if (companyResult.IsSuccess)
            {
                var company = companyResult.Value;
                company.UpdateMedia(data.Logo, "https://images.unsplash.com/photo-1554469384-e58fac16e23a?auto=format&fit=crop&w=1200&q=80");
                
                // Submit and Validate
                company.Submit();
                company.Validate();
                
                if (data.IsPremium)
                {
                    company.SetFeatured(true);
                }

                context.Companies.Add(company);

                // Add Subscription if Premium
                if (data.IsPremium)
                {
                    var planToUse = random.Next(2) == 0 ? premiumPlan : enterprisePlan;
                    var subId = Guid.NewGuid();
                    var subResult = Subscription.Create(subId, company.Id, planToUse.Id, planToUse.DurationDays);
                    
                    if (subResult.IsSuccess)
                    {
                        var sub = subResult.Value;
                        sub.Activate();

                        var paymentResult = Payment.Create(
                            Guid.NewGuid(),
                            company.Id,
                            sub.Id,
                            planToUse.Price,
                            "XAF",
                            PaymentMethod.MTNMoMo,
                            "MOMO-" + random.Next(1000000, 9999999),
                            "https://example.com/invoice.pdf",
                            DateTimeOffset.UtcNow
                        );

                        if (paymentResult.IsSuccess)
                        {
                            var payment = paymentResult.Value;
                            payment.MarkAsSucceeded();
                            sub.AddPayment(payment);
                        }

                        company.SetActiveSubscription(sub.Id);
                        context.Subscriptions.Add(sub);

                        // Find the User ID for this owner
                        var owner = owners.First(o => o.Id == data.OwnerId);
                        var notifResult = Notification.Create(
                            owner.Id.ToString(),
                            "payment_succeeded",
                            $"Paiement de {planToUse.Price} XAF reçu pour l'abonnement {planToUse.Name}.",
                            $"/espace/abonnements"
                        );

                        if (notifResult.IsSuccess)
                        {
                            notifications.Add(notifResult.Value);
                        }
                    }
                }
            }
        }

        await context.SaveChangesAsync();

        if (notifications.Any())
        {
            context.Notifications.AddRange(notifications);
            await context.SaveChangesAsync();
        }

        logger.LogInformation("Successfully seeded companies, subscriptions, payments, and notifications.");
    }
}
