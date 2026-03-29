
using ANNUAIRECONGO.Domain.Common;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Companies;
using ANNUAIRECONGO.Domain.Subscriptions.Enums;
using ANNUAIRECONGO.Domain.Subscriptions.Payments;
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
    private Subscription(Guid id, Guid companyId, Guid planId,int durationDays) : base(id)
    {
        CompanyId = companyId;
        PlanId = planId;
        Status = SubscriptionStatus.Pending;
        StartedAt = DateTime.UtcNow;
        ExpiresAt = StartedAt.AddDays(durationDays);

    }

    public static Result<Subscription> Create(
        Guid id,
        Guid companyId,
        Guid planId,
        int durationDays)
    {
        var now = DateTime.UtcNow;
        if (durationDays <= 0)
            return SubscriptionErrors.InvalidDuration;
        if (planId == Guid.Empty)
            return SubscriptionErrors.PlanIdRequired;

        return new Subscription(id,companyId,planId,durationDays);
    }

    public Result<Updated> Activate()
    {
        if (Status != SubscriptionStatus.Pending)
            return SubscriptionErrors.NotPending;

        Status = SubscriptionStatus.Active;

        return Result.Updated;
    }

    public Result<Updated> MarkAsExpiringSoon()
    {
        Status = SubscriptionStatus.ExpiringSoon;
        return Result.Updated;
    }

    public Result<Updated> MarkAsExpired()
    {
        Status = SubscriptionStatus.Expired;
        return Result.Updated;
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
