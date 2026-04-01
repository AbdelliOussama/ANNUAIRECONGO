using ANNUAIRECONGO.Contracts.Common;

namespace ANNUAIRECONGO.Contracts.Requests.Subscriptions;

public class SubscribeRequest
{
   public Guid CompanyId { get; set; }
    public Guid PlanId { get; set; }
    public PaymentMethod Method { get; set; }
}