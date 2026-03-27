using ANNUAIRECONGO.Domain.Companies;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ANNUAIRECONGO.Infrastructure.Data.Configurations;

public class CompanySectorConfigurations : IEntityTypeConfiguration<CompanySector>
{
    public void Configure(EntityTypeBuilder<CompanySector> builder)
    {
        builder.HasKey(c => c.Id);
        builder.HasOne(c => c.Sector).WithMany(c => c.CompanySectors).HasForeignKey(c => c.SectorId);
    }
}