
using AnnuaireCongo.Domain.Payments;
using ANNUAIRECONGO.Domain.Common;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Companies;
using ANNUAIRECONGO.Domain.Subscriptions.Enums;
using ANNUAIRECONGO.Domain.Subscriptions.Plans;

namespace ANNUAIRECONGO.Domain.Subscriptions;

public class Subscription : AuditableEntity
{
    public Guid CompanyId { get; private set; }
    public Guid PlanId { get; private set; }
    public SubscriptionStatus Status { get; private set; }
    public DateTime StartedAt { get; private set; }
    public DateTime ExpiresAt { get; private set; }

    public Company Company { get; private set; } = null!;
    public Plan Plan { get; private set; } = null!;

    private readonly List<Payment> _payments = [];
    public IReadOnlyCollection<Payment> Payments => _payments.AsReadOnly();

    private Subscription() { }

    public static Result<Subscription> Create(
        Guid companyId,
        Guid planId,
        int durationDays)
    {
        var now = DateTime.UtcNow;
        return new Subscription
        {
            CompanyId = companyId,
            PlanId = planId,
            Status = SubscriptionStatus.Pending,
            StartedAt = now,
            ExpiresAt = now.AddDays(durationDays)
        };
    }

    public Result<Success> Activate(string ownerId, string planName)
    {
        if (Status != SubscriptionStatus.Pending)
            return SubscriptionErrors.NotPending;

        Status = SubscriptionStatus.Active;

        return Result.Success;
    }

    public Result<Success> MarkAsExpiringSoon(string ownerId)
    {
        if (ownerId is null)
        {
            return SubscriptionErrors.OwnerIdRequired;
        }
        Status = SubscriptionStatus.ExpiringSoon;

        return Result.Success;
    }

    public Result<Success> MarkAsExpired(string ownerId)
    {
        if(ownerId is null)
        {
            return SubscriptionErrors.OwnerIdRequired;
        }
        Status = SubscriptionStatus.Expired;
        return Result.Success;
    }

    public Result<Updated> Cancel()
    {
        if (Status is SubscriptionStatus.Expired or SubscriptionStatus.Cancelled)
            return SubscriptionErrors.CannotCancel;

        Status = SubscriptionStatus.Cancelled;
        return Result.Updated;
    }
    public Result<Updated> AddPayment(Payment payment)
    {
        _payments.Add(payment);
        return Result.Updated;
    }
    public Result<Success> IsActive() {
        var result = Status is SubscriptionStatus.Active
        or SubscriptionStatus.ExpiringSoon;
        if(result)
        {
            return Result.Success;
        }
        return SubscriptionErrors.NotActive;
    }
}
