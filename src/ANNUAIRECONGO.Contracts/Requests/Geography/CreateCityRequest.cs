using System.ComponentModel.DataAnnotations;

namespace ANNUAIRECONGO.Contracts.Requests.Geography;

public class CreateCityRequest
{
    [Required(ErrorMessage = "Name is required")]
    public required string Name { get; set; }
    [Required(ErrorMessage = "RegionId is required")]
    public Guid RegionId { get; set; }
}
