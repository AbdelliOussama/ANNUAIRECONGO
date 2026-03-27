using ANNUAIRECONGO.Domain.Analytics;
using ANNUAIRECONGO.Domain.Companies.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ANNUAIRECONGO.Infrastructure.Data.Configurations;

public class ContactClickConfigurations : IEntityTypeConfiguration<ContactClick>
{
    public void Configure(EntityTypeBuilder<ContactClick> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.CompanyId).IsRequired();
        builder.Property(x => x.ContactType).IsRequired();
        builder.Property(x => x.ClickedAt).IsRequired();

        builder.HasIndex(x => new { x.CompanyId, x.ClickedAt });
    }
}