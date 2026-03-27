using ANNUAIRECONGO.Domain.Analytics;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ANNUAIRECONGO.Infrastructure.Data.Configurations;

public class AnalyticsDailySummaryConfigurations : IEntityTypeConfiguration<AnalyticsDailySummary>
{
    public void Configure(EntityTypeBuilder<AnalyticsDailySummary> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.CompanyId).IsRequired();
        builder.Property(x => x.SummaryDate).IsRequired();
        builder.Property(x => x.ProfileViews).IsRequired();
        builder.Property(x => x.ContactClicks).IsRequired();
        builder.Property(x => x.SearchAppearances).IsRequired();

        builder.HasIndex(x => new { x.CompanyId, x.SummaryDate }).IsUnique();
    }
}