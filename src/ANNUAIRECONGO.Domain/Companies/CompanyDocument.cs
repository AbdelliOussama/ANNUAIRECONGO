
using ANNUAIRECONGO.Domain.Common;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Companies.Enums;

namespace ANNUAIRECONGO.Domain.Companies;

public class CompanyDocument : Entity
{
    public Guid CompanyId { get; private set; }
    public DocumentType DocType { get; private set; }
    public string FileUrl { get; private set; } = string.Empty;
    public bool IsPublic { get; private set; }
    public DateTime UploadedAt { get; private set; }

    private CompanyDocument() { }

    private CompanyDocument(Guid companyId, DocumentType docType, string fileUrl, bool isPublic)
    {
        CompanyId = companyId;
        DocType = docType;
        FileUrl = fileUrl;
        IsPublic = isPublic;
        UploadedAt = DateTime.UtcNow;
    }

    public static Result<CompanyDocument> Create(
        Guid companyId,
        DocumentType docType,
        string fileUrl,
        bool isPublic = false)
    {
        return new CompanyDocument
        {
            CompanyId = companyId,
            DocType = docType,
            FileUrl = fileUrl,
            IsPublic = isPublic,
            UploadedAt = DateTime.UtcNow
        };
    }

    public void SetPublic(bool isPublic) => IsPublic = isPublic;
}
