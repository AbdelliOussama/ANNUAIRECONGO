namespace ANNUAIRECONGO.Contracts.Requests.Companies;

public class CreateCompanyRequest
{
    public string Name { get; set; } = string.Empty;
    public Guid CityId { get; set; }
    public IEnumerable<Guid> SectorIds { get; set; } = Enumerable.Empty<Guid>();
    public string Description { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
}