using ANNUAIRECONGO.Domain.Analytics;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ANNUAIRECONGO.Infrastructure.Data.Configurations;

public class ProfileViewConfigurations : IEntityTypeConfiguration<ProfileView>
{
    public void Configure(EntityTypeBuilder<ProfileView> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.CompanyId).IsRequired();
        builder.Property(x => x.ViewerIp).IsRequired().HasMaxLength(45); // IPv6 max length
        builder.Property(x => x.ViewedAt).IsRequired();

        builder.HasIndex(x => new { x.CompanyId, x.ViewedAt });
    }
}