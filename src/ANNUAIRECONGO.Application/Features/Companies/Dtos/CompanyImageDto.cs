namespace ANNUAIRECONGO.Application.Features.Companies.Dtos;

public class CompanyImageDto
{
    public Guid Id { get; set; }
    public Guid CompanyId { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public string? Caption { get; set; }
    public int? DisplayOrder { get; set; }
    public DateTime UploadedAt { get; set; }
}
