using ANNUAIRECONGO.Domain.Companies;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ANNUAIRECONGO.Infrastructure.Data.Configurations;

public class CompanyReportConfigurations : IEntityTypeConfiguration<CompanyReport>
{
    public void Configure(EntityTypeBuilder<CompanyReport> builder)
    {
        builder.ToTable("CompanyReports");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.CompanyId).IsRequired();
        builder.Property(x => x.ReporterIp).IsRequired().HasMaxLength(45); // IPv6 max length
        builder.Property(x => x.Reason).IsRequired().HasMaxLength(500);
        builder.Property(x => x.Status).IsRequired();
        builder.Property(x => x.CreatedAt).IsRequired();

        builder.HasIndex(x => x.CompanyId);
        builder.HasIndex(x => x.CreatedAt);
        builder.HasIndex(x => x.Status);
    }
}