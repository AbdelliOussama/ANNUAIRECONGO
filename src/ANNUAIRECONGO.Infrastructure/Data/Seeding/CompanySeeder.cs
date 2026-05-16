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

        var maritimeSector = sectors.FirstOrDefault(s => s.Name == "Maritime & Portuaire") ?? sectors.First();
        var logistiqueSector = sectors.FirstOrDefault(s => s.Name == "Logistique & Transport") ?? sectors.First();
        var douaneSector = sectors.FirstOrDefault(s => s.Name == "Douane & Transit") ?? sectors.First();
        var industrieSector = sectors.FirstOrDefault(s => s.Name == "Industrie") ?? sectors.First();
        var securiteSector = sectors.FirstOrDefault(s => s.Name == "Sécurité") ?? sectors.First();
        var manutentionSector = sectors.FirstOrDefault(s => s.Name == "Manutention & Entreposage") ?? sectors.First();

        var premiumPlan = plans.FirstOrDefault(p => p.Name == PlanName.Premium) ?? plans.First();
        var enterprisePlan = plans.FirstOrDefault(p => p.Name == PlanName.Pro) ?? plans.Last();

        var companyDataList = new List<(string Name, string Desc, Guid CityId, Guid SectorId, Guid OwnerId, bool IsPremium, string Logo)>
        {
            ("Bolloré Transport & Logistics", "Leader de la logistique et de la manutention portuaire au Congo.", pointeNoire.Id, logistiqueSector.Id, owners[random.Next(owners.Count)].Id, true, "https://via.placeholder.com/150/0033a0/ffffff?text=Bollore"),
            ("Congo Terminal", "Opérateur du terminal à conteneurs du Port de Pointe-Noire.", pointeNoire.Id, manutentionSector.Id, owners[random.Next(owners.Count)].Id, true, "https://via.placeholder.com/150/ff6600/ffffff?text=Congo+Terminal"),
            ("Société de Services Maritimes (SSM)", "Services maritimes, consignation de navires et assistance portuaire.", pointeNoire.Id, maritimeSector.Id, owners[random.Next(owners.Count)].Id, true, "https://via.placeholder.com/150/000080/ffffff?text=SSM"),
            ("SARIS Congo", "Agro-industrie spécialisée dans la production et la transformation sucrière.", brazzaville.Id, industrieSector.Id, owners[random.Next(owners.Count)].Id, true, "https://via.placeholder.com/150/008000/ffffff?text=SARIS"),
            ("Brasco", "Brasseries du Congo, principal producteur et distributeur de boissons industrielles au Congo.", brazzaville.Id, industrieSector.Id, owners[random.Next(owners.Count)].Id, false, "https://via.placeholder.com/150/ff0000/ffffff?text=Brasco"),
            ("G4S Congo", "Leader mondial des solutions de sécurité intégrées et de gardiennage.", brazzaville.Id, securiteSector.Id, owners[random.Next(owners.Count)].Id, true, "https://via.placeholder.com/150/d32f2f/ffffff?text=G4S"),
            ("SCG-Ré", "Société congolaise spécialisée dans la sécurité et la prévention des risques.", pointeNoire.Id, securiteSector.Id, owners[random.Next(owners.Count)].Id, false, "https://via.placeholder.com/150/1e1e1e/ffffff?text=SCG"),
            ("GETMA Congo", "Manutention, transit et consignation au Port Autonome de Pointe-Noire.", pointeNoire.Id, douaneSector.Id, owners[random.Next(owners.Count)].Id, true, "https://via.placeholder.com/150/1976d2/ffffff?text=GETMA"),
            ("DHL Express Congo", "Leader mondial de la logistique et du transport express international.", brazzaville.Id, logistiqueSector.Id, owners[random.Next(owners.Count)].Id, false, "https://upload.wikimedia.org/wikipedia/commons/b/b3/DHL_Logo.svg"),
            ("Société Nationale des Pétroles du Congo (SNPC)", "Industrie lourde et valorisation des ressources pétrolières congolaises.", brazzaville.Id, industrieSector.Id, owners[random.Next(owners.Count)].Id, true, "https://via.placeholder.com/150/000000/ffffff?text=SNPC"),
            ("SOCOTRAN", "Transit, douane et commissionnaire en douane agréé en République du Congo.", pointeNoire.Id, douaneSector.Id, owners[random.Next(owners.Count)].Id, false, "https://via.placeholder.com/150/ff9800/ffffff?text=SOCOTRAN"),
            ("Énergie Électrique du Congo (E2C)", "Industrie de production, transport et distribution de l'électricité.", pointeNoire.Id, industrieSector.Id, owners[random.Next(owners.Count)].Id, false, "https://via.placeholder.com/150/ffff00/000000?text=E2C"),
            ("Ocean Network Express (ONE)", "Transport maritime par conteneurs et logistique internationale.", pointeNoire.Id, maritimeSector.Id, owners[random.Next(owners.Count)].Id, false, "https://upload.wikimedia.org/wikipedia/commons/2/2f/ONE_Ocean_Network_Express_logo.svg"),
            ("Brazza Sécurité", "Services de gardiennage, vidéosurveillance et transport de fonds.", brazzaville.Id, securiteSector.Id, owners[random.Next(owners.Count)].Id, true, "https://via.placeholder.com/150/0033cc/ffffff?text=Brazza+Securite"),
            ("Entreprise de Manutention Congolaise", "Services d'entreposage, de levage et de manutention industrielle.", pointeNoire.Id, manutentionSector.Id, owners[random.Next(owners.Count)].Id, false, "https://via.placeholder.com/150/808080/ffffff?text=EMC")
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
                
                // Seed primary and social contacts
                var phoneResult = CompanyContact.Create(company.Id, ContactType.Phone, $"+242 06 {random.Next(100, 999)} {random.Next(1000, 9999)}", true);
                if(phoneResult.IsSuccess) context.CompanyContacts.Add(phoneResult.Value);
                
                var cleanName = new string(data.Name.Where(c => char.IsLetterOrDigit(c)).ToArray()).ToLower();
                var emailResult = CompanyContact.Create(company.Id, ContactType.Email, $"contact@{cleanName}.cg", true);
                if(emailResult.IsSuccess) context.CompanyContacts.Add(emailResult.Value);

                var facebookResult = CompanyContact.Create(company.Id, ContactType.Facebook, $"https://facebook.com/{cleanName}", false);
                if(facebookResult.IsSuccess) context.CompanyContacts.Add(facebookResult.Value);

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
