using System.Collections.Generic;

namespace ANNUAIRECONGO.Contracts.Requests.Companies;

public class GenerateCompanyDescriptionRequest
{
    public string Name { get; set; } = string.Empty;
    public IEnumerable<string> Sectors { get; set; } = [];
    public string City { get; set; } = string.Empty;
    public IEnumerable<string> Services { get; set; } = [];
}
