using ANNUAIRECONGO.Contracts.Common;

namespace ANNUAIRECONGO.Contracts.Requests.Companies.Services;

public class AddServiceRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
}