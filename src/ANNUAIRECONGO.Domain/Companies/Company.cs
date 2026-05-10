
using ANNUAIRECONGO.Domain.BusinessOwners;
using ANNUAIRECONGO.Domain.Common;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Companies.Enums;
using ANNUAIRECONGO.Domain.Geography;
using ANNUAIRECONGO.Domain.Subscriptions;
using ANNUAIRECONGO.Domain.Subscriptions.Plans;

namespace ANNUAIRECONGO.Domain.Companies;

public class Company : AuditableEntity
{
    // ── Identity ──────────────────────────────────────────────────
    public Guid? OwnerId { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string Slug { get; private set; } = string.Empty;
    public string? Description { get; private set; }

    // ── Media ─────────────────────────────────────────────────────
    public string? LogoUrl { get; private set; }
    public string? CoverUrl { get; private set; }
    public string? Website { get; private set; }

    // ── Location ──────────────────────────────────────────────────
    public Guid CityId { get; private set; }
    public string? Address { get; private set; }
    public decimal? Latitude { get; private set; }
    public decimal? Longitude { get; private set; }

    // ── Registration Details ──────────────────────────────────────
    public string? Rccm { get; private set; }
    public string? Niu { get; private set; }
    public int? YearFounded { get; private set; }

    // ── Status & Plan ─────────────────────────────────────────────
    public CompanyStatus Status { get; private set; }
    public string? RejectionReason { get; private set; }
    public Guid? ActiveSubscriptionId { get; private set; }
    public bool IsFeatured { get; private set; }
    public bool IsVerified { get; private set; }
    public bool IsPremium { get; private set; }

    // ── Navigation Properties ─────────────────────────────────────
    public BusinessOwner? Owner { get; private set; }
    public City City { get; private set; } = null!;

    private readonly List<CompanySector> _companySectors = [];
    private readonly List<CompanyContact> _contacts = [];
    private readonly List<CompanyService> _services = [];
    private readonly List<CompanyDocument> _documents = [];
    private readonly List<CompanyImage> _images = [];
    private readonly List<CompanyReport> _reports = [];
    private readonly List<Subscription> _subscriptions = [];

    public IReadOnlyCollection<CompanySector> CompanySectors => _companySectors.AsReadOnly();
    public IReadOnlyCollection<CompanyContact> Contacts => _contacts.AsReadOnly();
    public IReadOnlyCollection<CompanyService> Services => _services.AsReadOnly();
    public IReadOnlyCollection<CompanyDocument> Documents => _documents.AsReadOnly();
    public IReadOnlyCollection<CompanyImage> Images => _images.AsReadOnly();
    public IReadOnlyCollection<CompanyReport> Reports => _reports.AsReadOnly();
    public IReadOnlyCollection<Subscription> Subscriptions => _subscriptions.AsReadOnly();

    // ── Constructors ──────────────────────────────────────────────

    #pragma warning disable CS8618
    private Company() { }

    private Company(Guid id, Guid? ownerId, string name, Guid cityId, CompanyStatus status,string description, bool isFeatured, string? rejectionReason,string address,decimal ?latitude,decimal? longitude, string? rccm, string? niu, int? yearFounded, bool isVerified, bool isPremium):base(id)
    {
        OwnerId = ownerId;
        Name = name;
        Description = description;
        Address = address;
        Latitude = latitude;
        Longitude = longitude;
        CityId = cityId;
        Slug = SlugHelper.GenerateSlug(name);
        Status = status;
        IsFeatured = isFeatured;
        RejectionReason = rejectionReason;
        Rccm = rccm;
        Niu = niu;
        YearFounded = yearFounded;
        IsVerified = isVerified;
        IsPremium = isPremium;
        CreatedAtUtc = DateTime.UtcNow;
    }

    // ── Factory ───────────────────────────────────────────────────

    public static Result<Company> Create(
        Guid Id,
        Guid? ownerId,
        string name,
        Guid cityId,
        string description,
        string Address,
        decimal ?Latitude,
        decimal? Longitude,
        IEnumerable<Guid> sectorIds,
        string? rccm = null,
        string? niu = null,
        int? yearFounded = null,
        bool isVerified = false,
        bool isPremium = false)
    {
        var company = new Company(Id,ownerId,name,cityId,CompanyStatus.Draft,description,false,null,Address,Latitude,Longitude, rccm, niu, yearFounded, isVerified, isPremium);


        foreach (var sectorId in sectorIds)
            company._companySectors.Add(CompanySector.Create(company.Id, sectorId).Value);
        return company;
    }

    // ── Profile Update ────────────────────────────────────────────

    public Result<Updated> UpdateProfile(
        string name,
        string? description,
        string? website,
        Guid cityId,
        string address,
        decimal? latitude,
        decimal? longitude,
        IEnumerable<Guid> sectorIds,
        string? rccm = null,
        string? niu = null,
        int? yearFounded = null,
        bool? isVerified = null,
        bool? isPremium = null)
    {
        Name = name;
        Slug = SlugHelper.GenerateSlug(name);
        Description = description;
        Website = website;
        CityId = cityId;
        Address = address;
        Latitude = latitude;
        Longitude = longitude;
        if (rccm != null) Rccm = rccm;
        if (niu != null) Niu = niu;
        if (yearFounded != null) YearFounded = yearFounded;
        if (isVerified.HasValue) IsVerified = isVerified.Value;
        if (isPremium.HasValue) IsPremium = isPremium.Value;

        _companySectors.Clear();
        foreach (var sectorId in sectorIds)
            _companySectors.Add(CompanySector.Create(Id, sectorId).Value);
        return Result.Updated;
    }

    public Result<Updated> UpdateMedia(string? logoUrl, string? coverUrl)
    {
        LogoUrl = logoUrl;
        CoverUrl = coverUrl;
        return Result.Updated;
    }

    // ── Status Transitions ────────────────────────────────────────

    public Result<Updated> Submit()
    {
        if (Status != CompanyStatus.Draft)
            return CompanyErrors.NotInDraft;
        Status = CompanyStatus.Pending;
        return Result.Updated;
    }
    public Result<Updated> Validate()
    {
        if (Status != CompanyStatus.Pending)
            return CompanyErrors.NotPending;
        Status = CompanyStatus.Active;
        RejectionReason = null;
        return Result.Updated;
    }
    public Result<Updated> Reject(string reason)
    {
        if (Status != CompanyStatus.Pending)
            return CompanyErrors.NotPending;

        if (string.IsNullOrWhiteSpace(reason))
            return CompanyErrors.RejectionReasonRequired;

        Status = CompanyStatus.Rejected;
        RejectionReason = reason;
        return Result.Updated;
    }

    public Result<Updated> Suspend()
    {
        if (Status != CompanyStatus.Active)
            return CompanyErrors.NotActive;

        Status = CompanyStatus.Suspended;
        return Result.Updated;
    }

    public Result<Updated> Reactivate()
    {
        if (Status != CompanyStatus.Suspended)
            return CompanyErrors.NotSuspended;

        Status = CompanyStatus.Active;
        return Result.Updated;
    }

    // ── Plan Management ───────────────────────────────────────────

    public Result<Updated> SetActiveSubscription(Guid subscriptionId)
    {
        ActiveSubscriptionId = subscriptionId;
        return Result.Updated;
    }

    public Result<Updated> ClearActiveSubscription()
    {
        ActiveSubscriptionId = null;
        return Result.Updated;
    }


    public Result<Updated> SetFeatured(bool isFeatured)
    {
        IsFeatured = isFeatured;
        return Result.Updated;
    }
    // ── Helpers ───────────────────────────────────────────────────

    public bool IsOwnedBy(string? userId)
    {
        if (!Guid.TryParse(userId, out var id)) return false;
        return OwnerId == id;
    }
    public void ClearOwner()
    {
        OwnerId = null;
    }


}
