using ANNUAIRECONGO.Domain.Companies;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ANNUAIRECONGO.Infrastructure.Data.Configurations;

public class CompanyImageConfigurations : IEntityTypeConfiguration<CompanyImage>
{
    public void Configure(EntityTypeBuilder<CompanyImage> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.ImageUrl).HasMaxLength(255).IsRequired();
        builder.Property(x => x.Caption).HasMaxLength(255).IsRequired(false);
        builder.Property(x => x.DisplayOrder).IsRequired();
        builder.Property(x => x.UploadedAt).IsRequired();
        builder.HasOne<Company>().WithMany().HasForeignKey(x => x.CompanyId).OnDelete(DeleteBehavior.Cascade);
    }
}