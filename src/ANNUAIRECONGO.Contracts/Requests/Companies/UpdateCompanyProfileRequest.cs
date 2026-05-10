namespace ANNUAIRECONGO.Contracts.Requests.Companies;

public class UpdateCompanyProfileRequest
{
    public required string Name { get; set; }
    public string? Description { get; set; }
    public string? Website { get; set; }
    public required Guid CityId { get; set; }
    public required string Address { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public required IEnumerable<Guid> SectorIds { get; set; }
    public string? Rccm { get; set; }
    public string? Niu { get; set; }
    public int? YearFounded { get; set; }
}
