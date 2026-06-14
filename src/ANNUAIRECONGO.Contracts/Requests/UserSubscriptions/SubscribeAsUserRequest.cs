using ANNUAIRECONGO.Contracts.Common;

namespace ANNUAIRECONGO.Contracts.Requests.UserSubscriptions;

public class SubscribeAsUserRequest
{
    public Guid          PlanId { get; set; }
    public PaymentMethod Method { get; set; }
}
