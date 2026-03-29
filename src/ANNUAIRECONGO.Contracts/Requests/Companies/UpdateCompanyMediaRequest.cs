namespace ANNUAIRECONGO.Contracts.Requests.Companies;

public class UpdateCompanyMediaRequest
{
    public Guid Id { get; set; }
    public string? LogoUrl { get; set; }
    public string? CoverUrl { get; set; }
}