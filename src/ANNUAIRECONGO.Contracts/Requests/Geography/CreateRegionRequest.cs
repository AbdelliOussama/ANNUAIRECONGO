using System.ComponentModel.DataAnnotations;

namespace ANNUAIRECONGO.Contracts.Requests.Geography;

public class CreateRegionRequest
{
    [Required(ErrorMessage = "Name is required")]
    public required string Name { get; set; }
}
