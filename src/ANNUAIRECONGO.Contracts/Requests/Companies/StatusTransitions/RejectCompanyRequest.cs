using ANNUAIRECONGO.Contracts.Common;

namespace ANNUAIRECONGO.Contracts.Requests.Companies.StatusTransitions;

public class RejectCompanyRequest
{
    public string Reason { get; set; } = string.Empty;
}
