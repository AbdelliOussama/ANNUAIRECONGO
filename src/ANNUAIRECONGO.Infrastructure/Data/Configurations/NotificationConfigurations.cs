using AnnuaireCongo.Domain.Notifications;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ANNUAIRECONGO.Infrastructure.Data.Configurations;

public class NotificationConfigurations : IEntityTypeConfiguration<Notification>
{
    public void Configure(EntityTypeBuilder<Notification> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.UserId).IsRequired().HasMaxLength(100);
        builder.Property(x => x.Type).IsRequired().HasMaxLength(50);

        // Audit fix #2 - canonical FE-side tone (info / success / warning / error).
        builder.Property(x => x.Tone).IsRequired().HasMaxLength(20);

        builder.Property(x => x.Message).IsRequired().HasMaxLength(500);

        // Audit fix #2 - destination for FE click-through (e.g. /espace/abonnement).
        builder.Property(x => x.Link).HasMaxLength(500);

        builder.Property(x => x.IsRead).IsRequired();
        builder.Property(x => x.CreatedAt).IsRequired();

        builder.HasIndex(x => x.UserId);
        builder.HasIndex(x => x.CreatedAt);
    }
}
