

using ANNUAIRECONGO.Domain.Common;
using ANNUAIRECONGO.Domain.Common.Results;

namespace ANNUAIRECONGO.Domain.Geography;

public class Region : AuditableEntity
{
    public string Name { get; private set; } = string.Empty;
    public string Slug { get; private set; } = string.Empty;

    private List<City>_Cities = [];
    public ICollection<City> Cities =>_Cities.AsReadOnly();
    private Region() { }

    private Region(Guid id, string name, List<City> cities):base(id)
    {
        Name=name;
        _Cities=cities;
    }

    public static Result<Region> Create(Guid id,string name)
    {
        if(id == Guid.Empty)
        {
            return RegionErrors.RegionIdRequired;
        }
        if (string.IsNullOrWhiteSpace(name))
        {
            return RegionErrors.NameRequired;
        }
        return new Region
        {
            Name = name,
            Slug = GenerateSlug(name)
        };
    }

    public Result<Updated>Update(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            return RegionErrors.NameRequired;
        }
        Name = name;
        Slug = GenerateSlug(name);
        return Result.Updated;
    }

    private static string GenerateSlug(string name) =>
        name.ToLowerInvariant()
            .Replace(" ", "-")
            .Replace("'", "")
            .Trim('-');
}
