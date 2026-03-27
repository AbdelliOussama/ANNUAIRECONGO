

using ANNUAIRECONGO.Domain.Common;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Subscriptions.Plans.Enums;

namespace ANNUAIRECONGO.Domain.Subscriptions.Plans;

public class Plan : AuditableEntity
{
    public PlanName Name { get; private set; }
    public decimal Price { get; private set; }
    public int DurationDays { get; private set; }
    public int MaxImages { get; private set; }
    public int MaxDocuments { get; private set; }
    public bool HasAnalytics { get; private set; }
    public bool HasFeaturedBadge { get; private set; }

    // 1 = top of search, 3 = bottom
    public int SearchPriority { get; private set; }
    public bool IsActive { get; private set; } = true;

    private Plan() { }
    private Plan(Guid id,PlanName planName,decimal price,int durationdays,int maxImages,int maxDocuments,bool hasAnalytics,bool hasFeaturedBadge,int searchPriority):base(id)
    {
        Name = planName;
        Price = price;
        DurationDays = durationdays;
        MaxImages = maxImages;
        MaxDocuments = maxDocuments;
        HasAnalytics = hasAnalytics;
        HasFeaturedBadge = hasFeaturedBadge;
        SearchPriority = searchPriority;
    }

    public static Result<Plan> Create(
        PlanName name,
        decimal price,
        int durationDays,
        int maxImages,
        int maxDocuments,
        bool hasAnalytics,
        bool hasFeaturedBadge,
        int searchPriority)
    {
        if(price < 0)
        {
            return PlanErrors.InvalidPrice;
        }
        if(durationDays <= 0)
            return PlanErrors.InvalidDuration;
        if(searchPriority < 1 || searchPriority > 3)
        {
            return PlanErrors.InvalidSearchPriority;
        }
        return new Plan
        {
            Name = name,
            Price = price,
            DurationDays = durationDays,
            MaxImages = maxImages,
            MaxDocuments = maxDocuments,
            HasAnalytics = hasAnalytics,
            HasFeaturedBadge = hasFeaturedBadge,
            SearchPriority = searchPriority,
            IsActive = true
        };

    }

    public Result<Updated> Deactivate()
    {
        if (!IsActive)
        {
            return PlanErrors.AlreadyInactive;
        }
        IsActive = false;
        return Result.Updated;
    }
    public Result<Updated> Activate()
    {
        if (IsActive)
        {
            return PlanErrors.AlreadyActive;
        }
        IsActive = true;
        return Result.Updated;
    }
}
