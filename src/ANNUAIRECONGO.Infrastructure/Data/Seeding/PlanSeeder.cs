using ANNUAIRECONGO.Domain.Subscriptions.Plans;
using ANNUAIRECONGO.Domain.Subscriptions.Plans.Enums;
using Microsoft.EntityFrameworkCore;

namespace ANNUAIRECONGO.Infrastructure.Data.Seeding;

public static class PlanSeeder
{
    public static async Task SeedPlansAsync(AppDbContext context)
    {
        var existingPlans = await context.Plans.ToListAsync();
        
        var targetPlans = new[]
        {
            (Name: PlanName.Free,    Price: 0m,     Days: 365, Img: 3,  Doc: 1,  Stats: false, Featured: false, Priority: 3),
            (Name: PlanName.Pro,     Price: 25000m, Days: 30,  Img: 10, Doc: 5,  Stats: true,  Featured: false, Priority: 2),
            (Name: PlanName.Premium, Price: 75000m, Days: 30,  Img: 50, Doc: 20, Stats: true,  Featured: true,  Priority: 1),
        };

        foreach (var target in targetPlans)
        {
            var plan = existingPlans.FirstOrDefault(p => p.Name == target.Name);
            if (plan == null)
            {
                var newPlan = Plan.Create(Guid.NewGuid(), target.Name, target.Price, target.Days, target.Img, target.Doc, target.Stats, target.Featured, target.Priority).Value;
                context.Plans.Add(newPlan);
            }
            else
            {
                plan.Update(target.Name, target.Price, target.Days, target.Img, target.Doc, target.Stats, target.Featured, target.Priority);
            }
        }

        await context.SaveChangesAsync();
    }
}
