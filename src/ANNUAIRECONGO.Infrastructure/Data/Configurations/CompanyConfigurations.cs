using System.Security.Cryptography.X509Certificates;
using ANNUAIRECONGO.Domain.BusinessOwners;
using ANNUAIRECONGO.Domain.Companies;
using ANNUAIRECONGO.Domain.Geography;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ANNUAIRECONGO.Infrastructure.Data.Configurations;

public class CompanyConfigurations : IEntityTypeConfiguration<Company>
{
    public void Configure(EntityTypeBuilder<Company> builder)
    {
        builder.HasIndex(x => x.Slug).IsUnique();
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Name).IsRequired().HasMaxLength(100);
        builder.Property(x => x.Slug).IsRequired().HasMaxLength(100);
        builder.Property(x => x.Description).IsRequired(false);
        builder.Property(x => x.Address).IsRequired(false);
        builder.Property(x => x.Latitude).HasPrecision(9, 6);
        builder.Property(x => x.Longitude).HasPrecision(9, 6);
    }
}