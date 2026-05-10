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
        builder.Property(x => x.Rccm).IsRequired(false).HasMaxLength(100);
        builder.Property(x => x.Niu).IsRequired(false).HasMaxLength(100);
        builder.Property(x => x.YearFounded).IsRequired(false);
        builder.Property(x => x.IsVerified).HasDefaultValue(false);
        builder.Property(x => x.IsPremium).HasDefaultValue(false);

        // ── Relationships ─────────────────────────────────────────────
        
        builder.HasOne(x => x.Owner)
            .WithMany(o => o.Companies)
            .HasForeignKey(x => x.OwnerId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(x => x.City)
            .WithMany()
            .HasForeignKey(x => x.CityId)
            .OnDelete(DeleteBehavior.Restrict);

        // ── Field Mappings for Encapsulated Collections ────────────────
        
        builder.Metadata.FindNavigation(nameof(Company.CompanySectors))!
            .SetPropertyAccessMode(PropertyAccessMode.Field);
            
        builder.Metadata.FindNavigation(nameof(Company.Contacts))!
            .SetPropertyAccessMode(PropertyAccessMode.Field);
            
        builder.Metadata.FindNavigation(nameof(Company.Services))!
            .SetPropertyAccessMode(PropertyAccessMode.Field);
            
        builder.Metadata.FindNavigation(nameof(Company.Documents))!
            .SetPropertyAccessMode(PropertyAccessMode.Field);
            
        builder.Metadata.FindNavigation(nameof(Company.Images))!
            .SetPropertyAccessMode(PropertyAccessMode.Field);
    }
}
