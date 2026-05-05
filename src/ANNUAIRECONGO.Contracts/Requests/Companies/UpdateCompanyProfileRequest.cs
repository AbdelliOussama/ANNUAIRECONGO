namespace ANNUAIRECONGO.Contracts.Requests.Companies;

public class UpdateCompanyProfileRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Website { get; set; }
    public Guid CityId { get; set; }
    public string? Address { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public IEnumerable<Guid> SectorIds { get; set; } = Enumerable.Empty<Guid>();
    public string? Rccm { get; set; }
    public string? Niu { get; set; }
    public int? YearFounded { get; set; }
    public bool? IsVerified { get; set; }
    public bool? IsPremium { get; set; }
}