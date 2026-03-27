using ANNUAIRECONGO.Domain.Companies;
using ANNUAIRECONGO.Domain.Sectors;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ANNUAIRECONGO.Infrastructure.Data.Configurations;

public class SectorConfigurations : IEntityTypeConfiguration<Sector>
{
    public void Configure(EntityTypeBuilder<Sector> builder)
    {
        builder.HasKey(s => s.Id);
        builder.Property(s => s.Name).HasMaxLength(100).IsRequired();
        builder.Property(s => s.Description).HasMaxLength(500);
        builder.Property(s => s.Slug).HasMaxLength(100).IsRequired();
        builder.Property(s => s.IconUrl).IsRequired(false);
        builder.Property(s => s.IsActive).IsRequired();
    }
}