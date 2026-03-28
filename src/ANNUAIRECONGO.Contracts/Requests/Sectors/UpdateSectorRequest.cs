namespace ANNUAIRECONGO.Contracts.Requests.Sectors;

public class UpdateSectorRequest
{
    public string Name { get; set; }
    public string? IConUrl { get; set; }
    public string? Description { get; set; }
}