using System.Text.Json.Serialization;
namespace ANNUAIRECONGO.Contracts.Requests.Companies;

public class UpdateCompanyProfileRequest
{
    public required string Name { get; set; }
    public string? Description { get; set; }
    [JsonPropertyName("websiteUrl")]
    public string? Website { get; set; }
    public required Guid CityId { get; set; }
    public required string Address { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public required IEnumerable<Guid> SectorIds { get; set; }
    public string? Rccm { get; set; }
    public string? Niu { get; set; }
    public int? YearFounded { get; set; }
    public string? LogoUrl { get; set; }
    public string? CoverUrl { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Email { get; set; }
}
