using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Companies;

namespace AnnuaireCongo.Tests.Common.Companies;

public static class CompanyImageFactory
{
    public static Result<CompanyImage> CreateCompanyImage(
        Guid? companyId = null,
        string? imageUrl = null,
        int? displayOrder = null,
        string? caption = null)
    {
        return CompanyImage.Create(
            companyId ?? Guid.NewGuid(),
            imageUrl ?? "https://storage.annuairetest.cg/images/company-photo-1.jpg",
            displayOrder ?? 1,
            caption ?? "Photo principale de l'entreprise"
        );
    }
}
