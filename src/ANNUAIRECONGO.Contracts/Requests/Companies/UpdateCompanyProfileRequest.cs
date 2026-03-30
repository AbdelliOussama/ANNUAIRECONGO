namespace ANNUAIRECONGO.Contracts.Requests.Companies;

public class UpdateCompanyProfileRequest
{
    public  string? Name { get; set;}
    public string? Description { get; set;}
    public string? Website { get; set;}
    public Guid CityId { get; set;}
    public string? Address { get; set;}
    public decimal? Latitude { get; set;}
    public decimal? Longitude { get; set;}
    public IEnumerable<Guid> SectorIds { get; set;}
}