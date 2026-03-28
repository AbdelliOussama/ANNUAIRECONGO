
using ANNUAIRECONGO.Domain.Common;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Companies;

namespace ANNUAIRECONGO.Domain.Geography;

public class City : AuditableEntity
{
    public Guid RegionId { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string Slug { get; private set; } = string.Empty;

    public Region Region { get; private set; } = null!;

    private readonly List<Company>_Companies = [];
    public ICollection<Company> Companies =>_Companies.AsReadOnly();

    private City() { }

    private City(Guid id,Guid regionId,string name) :base(id)
    {
        RegionId=regionId;
        Name=name;
        Slug=GenerateSlug(name);
    }

    public static Result<City> Create(Guid id,Guid regionId, string name)
    {
        if(id == Guid.Empty)
        {
            return CityErrors.CityIdRequired;
        }
        if(regionId == Guid.Empty)
        {
            return CityErrors.RegionIdRequired;
        }
        if (string.IsNullOrWhiteSpace(name))
        {
            return CityErrors.SlugAlreadyExists;
        }
        return new City(id,regionId,name);
    }

    public Result<Updated>Update(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            return CityErrors.NameRequired;
        }
        Name = name;
        Slug = GenerateSlug(name);
        return Result.Updated;
    }

    public Result<Updated>AddCompany(Company company)
    {
        _Companies.Add(company);
        return Result.Updated;
    }
    private static string GenerateSlug(string name) =>
        name.ToLowerInvariant()
            .Replace(" ", "-")
            .Replace("'", "")
            .Trim('-');
}
