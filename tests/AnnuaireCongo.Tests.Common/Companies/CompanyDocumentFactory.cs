using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Companies;
using ANNUAIRECONGO.Domain.Companies.Enums;

namespace AnnuaireCongo.Tests.Common.Companies;

public static class CompanyDocumentFactory
{
    public static Result<CompanyDocument> CreateCompanyDocument(
        Guid? companyId = null,
        DocumentType? docType = null,
        string? fileUrl = null,
        bool? isPublic = false)
    {
        return CompanyDocument.Create(
            companyId ?? Guid.NewGuid(),
            docType ?? DocumentType.RCCM,
            fileUrl ?? "https://storage.annuairetest.cg/docs/rccm-sample.pdf",
            isPublic
        );
    }
}
