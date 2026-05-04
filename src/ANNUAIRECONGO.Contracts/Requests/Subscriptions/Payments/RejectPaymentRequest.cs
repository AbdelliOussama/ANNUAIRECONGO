using ANNUAIRECONGO.Contracts.Common;

namespace ANNUAIRECONGO.Contracts.Requests.Subscriptions.Payments;

public class RejectPaymentRequest
{
    public string Reason { get; set; } = string.Empty;
}
