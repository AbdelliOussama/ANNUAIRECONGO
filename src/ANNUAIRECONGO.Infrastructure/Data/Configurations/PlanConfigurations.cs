using ANNUAIRECONGO.Domain.Subscriptions.Plans;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ANNUAIRECONGO.Infrastructure.Data.Configurations;

public class PlanConfigurations : IEntityTypeConfiguration<Plan>
{
    public void Configure(EntityTypeBuilder<Plan> builder)
    {
        builder.ToTable("Plans");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name).IsRequired();
        builder.Property(x => x.Price).IsRequired().HasColumnType("decimal(18,2)");
        builder.Property(x => x.DurationDays).IsRequired();
        builder.Property(x => x.MaxImages).IsRequired();
        builder.Property(x => x.MaxDocuments).IsRequired();
        builder.Property(x => x.HasAnalytics).IsRequired();
        builder.Property(x => x.HasFeaturedBadge).IsRequired();
        builder.Property(x => x.SearchPriority).IsRequired();
        builder.Property(x => x.IsActive).IsRequired();

        builder.HasIndex(x => x.Name).IsUnique();
    }
}