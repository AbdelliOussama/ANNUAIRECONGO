namespace ANNUAIRECONGO.Contracts.Requests.Companies;

public class UpdateCompanyProfileRequest
{
    public  Guid companyId { get; set; }
    public  string? name { get; set;}
    public string? description { get; set;}
    public string? website { get; set;}
    public Guid cityId { get; set;}
    public string? address { get; set;}
    public decimal? latitude { get; set;}
    public decimal? longitude { get; set;}
    public IEnumerable<Guid> sectorIds { get; set;}
}