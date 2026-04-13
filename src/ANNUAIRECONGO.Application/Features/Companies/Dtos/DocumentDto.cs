using ANNUAIRECONGO.Domain.Companies.Enums;

namespace ANNUAIRECONGO.Application.Features.Companies.Dtos;

public class DocumentDto
{
    public Guid Id { get; set; }
    public Guid CompanyId { get; set; }
    public DocumentType DocType { get; set; }
    public string FileUrl { get; set; } = string.Empty;
    public bool? IsPublic { get; set; }
    public DateTime UploadedAt { get; set; }
}
