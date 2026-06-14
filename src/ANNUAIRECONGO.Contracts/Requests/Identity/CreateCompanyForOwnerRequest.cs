namespace ANNUAIRECONGO.Contracts.Requests.Identity;

/// <summary>
/// Payload for an Admin creating a company on behalf of a passive business owner
/// who has no system account and will never log in.
/// No authentication credentials are created — this stores contact info only.
/// </summary>
public sealed class CreateCompanyForOwnerRequest
{
    // ── Real-world owner contact info ────────────────────────────────────────
    public required string OwnerFirstName { get; set; }
    public required string OwnerLastName  { get; set; }
    public required string OwnerPhone     { get; set; }
    public required string OwnerEmail     { get; set; }
    public string?         OwnerPosition  { get; set; }

    // ── Company data ─────────────────────────────────────────────────────────
    public required string CompanyName    { get; set; }
    public Guid            CityId         { get; set; }
    public List<Guid>      SectorIds      { get; set; } = [];
    public string?         Website        { get; set; }
    public string?         Rccm           { get; set; }
    public string?         Niu            { get; set; }
}
