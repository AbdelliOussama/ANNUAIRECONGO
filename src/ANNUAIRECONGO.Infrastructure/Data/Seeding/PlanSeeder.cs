using ANNUAIRECONGO.Domain.Subscriptions.Plans;
using ANNUAIRECONGO.Domain.Subscriptions.Plans.Enums;
using Microsoft.EntityFrameworkCore;

namespace ANNUAIRECONGO.Infrastructure.Data.Seeding;

public static class PlanSeeder
{
    public static async Task SeedPlansAsync(AppDbContext context)
    {
        if (await context.Plans.AnyAsync())
            return;

        var plans = new[]
        {
            Plan.Create(Guid.NewGuid(),PlanName.Free,      0,      365, 3,  1,  false, false, 3).Value,
            Plan.Create(Guid.NewGuid(),PlanName.Pro,   5000,      30, 5,  2,  false, false, 2).Value,
            Plan.Create(Guid.NewGuid(),PlanName.Premium, 15000,     30, 15, 5,  true,  true,  1).Value,
        };

        context.Plans.AddRange(plans);
        await context.SaveChangesAsync();
    }
}