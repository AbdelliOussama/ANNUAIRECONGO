
using ANNUAIRECONGO.Domain.Common;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Companies;

namespace ANNUAIRECONGO.Domain.Sectors;

public class Sector : AuditableEntity
{
    public string Name { get; private set; } = string.Empty;
    public string Slug { get; private set; } = string.Empty;
    public string? IconUrl { get; private set; }
    public string? Description { get; private set; }
    public bool IsActive { get; private set; } = true;

    private List<CompanySector> _companySectors = [];
    public IEnumerable<CompanySector> CompanySectors =>_companySectors.AsReadOnly();
    private Sector() { }

    private Sector(Guid id,string name, string? description, string? iconUrl):base(id)
    {
        Name = name;
        Slug = GenerateSlug(name);
        Description = description;
        IconUrl = iconUrl;
        IsActive = true;
    }


    public static Result<Sector> Create(Guid id, string name, string? description = null, string? iconUrl = null)
    {
        if(id == Guid.Empty)
        {
            return SectorErrors.IdRequired;
        }
        if (name == null)
        {
            return SectorErrors.NameIsRequired;
        }
        return new Sector
        {
            Name = name,
            Slug = GenerateSlug(name),
            Description = description,
            IconUrl = iconUrl,
            IsActive = true
        };
    }

    public Result<Updated> Update(string name, string? description, string? iconUrl)
    {
        if (name == null)
        {
            return SectorErrors.NameIsRequired;
        }
        Name = name;
        Slug = GenerateSlug(name);
        Description = description;
        IconUrl = iconUrl;
        return Result.Updated;
    }

    public Result<Updated> Deactivate()
    {
        IsActive = false;
        return Result.Updated;
    }
    public Result<Updated> Activate()
    {
        IsActive = true;
        return Result.Updated;
    }

    private static string GenerateSlug(string name) =>
        name.ToLowerInvariant()
            .Replace(" ", "-")
            .Replace("'", "")
            .Trim('-');
}
