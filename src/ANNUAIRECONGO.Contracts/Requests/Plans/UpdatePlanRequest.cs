using System.ComponentModel.DataAnnotations;
using ANNUAIRECONGO.Contracts.Common;

namespace ANNUAIRECONGO.Contracts.Requests.Plans;

public class UpdatePlanRequest
{
    [Required(ErrorMessage = "Plan name is required.")]
    public PlanName Name { get; set; }
    [Required(ErrorMessage = "Plan price is required.")]
    public decimal Price { get; set; }
    [Required(ErrorMessage = "Plan duration is required.")]
    public int DurationDays { get; set; }
    [Required(ErrorMessage = "Plan max images is required.")]
    public int MaxImages { get; set; }
    [Required(ErrorMessage = "Plan max documents is required.")]
    public int MaxDocuments { get; set; }
    [Required(ErrorMessage = "Plan analytics is required.")]
    public bool HasAnalytics { get; set; }
    [Required(ErrorMessage = "Plan featured badge is required.")]
    public bool HasFeaturedBadge { get; set; }
    [Required(ErrorMessage = "Plan search priority is required.")]
    public int SearchPriority { get; set; }
}