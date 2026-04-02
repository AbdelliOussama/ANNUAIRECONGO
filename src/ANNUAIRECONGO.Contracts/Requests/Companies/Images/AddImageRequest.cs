namespace ANNUAIRECONGO.Contracts.Requests.Companies.Images;

public class AddImageRequest
{
    public string ImageUrl { get; set; } = null!;
    public string? Caption { get; set; }
    public int? DisplayOrder { get; set; }
}