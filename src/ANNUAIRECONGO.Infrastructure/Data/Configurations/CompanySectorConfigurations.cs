using ANNUAIRECONGO.Domain.Companies;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ANNUAIRECONGO.Infrastructure.Data.Configurations;

public class CompanySectorConfigurations : IEntityTypeConfiguration<CompanySector>
{
    public void Configure(EntityTypeBuilder<CompanySector> builder)
    {
        builder.HasKey(c => c.Id);
        
        builder.HasOne(c => c.Sector)
            .WithMany(s => s.CompanySectors)
            .HasForeignKey(c => c.SectorId);

        builder.HasOne(c => c.Company)
            .WithMany(cp => cp.CompanySectors)
            .HasForeignKey(c => c.CompanyId);

        builder.HasIndex(c => new { c.CompanyId, c.SectorId }).IsUnique();
    }
}
