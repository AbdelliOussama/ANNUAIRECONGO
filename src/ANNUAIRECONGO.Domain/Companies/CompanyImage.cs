
using ANNUAIRECONGO.Domain.Common;
using ANNUAIRECONGO.Domain.Common.Results;

namespace ANNUAIRECONGO.Domain.Companies;

public class CompanyImage : Entity
{
    public Guid CompanyId { get; private set; }
    public string ImageUrl { get; private set; } = string.Empty;
    public string? Caption { get; private set; }
    public int DisplayOrder { get; private set; }
    public DateTime UploadedAt { get; private set; }

    private CompanyImage() { }
    private CompanyImage(Guid companyId, string imageUrl, int displayOrder, string? caption)
    {
        CompanyId = companyId;
        ImageUrl = imageUrl;
        Caption = caption;
        DisplayOrder = displayOrder;
        UploadedAt = DateTime.UtcNow;
    }

    public static Result<CompanyImage> Create(
        Guid companyId,
        string imageUrl,
        int displayOrder,
        string? caption = null)
    {
        if (string.IsNullOrWhiteSpace(imageUrl))
            return CompanyErrors.ImageUrlRequired;

        return new CompanyImage(companyId, imageUrl, displayOrder, caption);
    }

    public Result<Updated> UpdateOrder(int displayOrder)
    {
        DisplayOrder = displayOrder;
        return Result.Updated;
    }

    public Result<Updated> UpdateCaption(string? caption)
    {
        Caption = caption;
        return Result.Updated;
    }
}
