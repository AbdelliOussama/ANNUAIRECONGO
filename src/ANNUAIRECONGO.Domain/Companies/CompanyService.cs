
using ANNUAIRECONGO.Domain.Common;
using ANNUAIRECONGO.Domain.Common.Results;

namespace ANNUAIRECONGO.Domain.Companies;

public class CompanyService : AuditableEntity
{
    public Guid CompanyId { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string? Description { get; private set; }

    private CompanyService() { }

    private CompanyService(Guid id,Guid companyId, string title, string? description)  : base(id)
    {
        CompanyId = companyId;
        Title = title;
        Description = description;
    }


    public static Result<CompanyService> Create(
        Guid id,
        Guid companyId,
        string title,
        string? description = null)
    {
        if (string.IsNullOrWhiteSpace(title))
            return CompanyErrors.ServiceTitleRequired;

        return new CompanyService(id,companyId, title, description);
    }

    public Result<Updated> Update(string title, string? description)
    {
        if (string.IsNullOrWhiteSpace(title))
            return CompanyErrors.ServiceTitleRequired;

        Title = title;
        Description = description;
        return Result.Updated;
    }
}
