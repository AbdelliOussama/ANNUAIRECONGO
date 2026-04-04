using ANNUAIRECONGO.Domain.BusinessOwners;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ANNUAIRECONGO.Infrastructure.Data.Configurations;

public class BusinessOwnerConfigurations : IEntityTypeConfiguration<BusinessOwner>
{
    public void Configure(EntityTypeBuilder<BusinessOwner> builder)
    {
        builder.ToTable("BusinessOwners");

        builder.HasKey(b => b.Id);

        builder.Property(b => b.FirstName)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(b => b.LastName)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(b => b.Phone)
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(b => b.CompanyPosition)
            .HasMaxLength(100);

        builder.Property(b => b.IsVerified)
            .IsRequired();

        builder.Ignore(b => b.Role);

        builder.HasMany(b => b.Companies)
            .WithOne(c => c.Owner)
            .HasForeignKey(c => c.OwnerId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}