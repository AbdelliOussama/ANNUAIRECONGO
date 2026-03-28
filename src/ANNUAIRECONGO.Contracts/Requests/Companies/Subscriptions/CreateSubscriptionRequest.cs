namespace ANNUAIRECONGO.Contracts.Requests.Companies.Subscriptions;

public class CreateSubscriptionRequest
{
    public Guid CompanyId { get; set; }
    public Guid PlanId{get;set;}
    public int DurationDays{get;set;}
}