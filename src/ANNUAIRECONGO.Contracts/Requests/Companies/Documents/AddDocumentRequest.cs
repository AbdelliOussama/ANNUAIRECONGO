namespace ANNUAIRECONGO.Contracts.Requests.Companies.Documents;

public class AddDocumentRequest
{
    public string DocumentUrl { get; set; } = null!;
    public string DocumentType { get; set; } = null!;
    public string? Description { get; set; }
    public bool IsPublic { get; set; }
}