
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
    public Guid OwnerId { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string Slug { get; private set; } = string.Empty;
    public string? Description { get; private set; }

    // ── Media ─────────────────────────────────────────────────────
    public string? LogoUrl { get; private set; }
    public string? CoverUrl { get; private set; }
    public string? Website { get; private set; }

    // ── Location ──────────────────────────────────────────────────
    public Guid CityId { get; private set; }
    public string Address { get; private set; }
    public decimal? Latitude { get; private set; }
    public decimal? Longitude { get; private set; }

    // ── Status & Plan ─────────────────────────────────────────────
    public CompanyStatus Status { get; private set; }
    public string? RejectionReason { get; private set; }
    public Guid? ActiveSubscriptionId { get; private set; }
    public bool IsFeatured { get; private set; }

    // ── Navigation Properties ─────────────────────────────────────
    public BusinessOwner Owner { get; private set; } = null!;
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

    private Company(Guid id, Guid ownerId, string name, Guid cityId, CompanyStatus status,string description, bool isFeatured, string? rejectionReason,string address,decimal ?latitude,decimal? longitude):base(id)
    {
        OwnerId = ownerId;
        Name = name;
        Description = description;
        Address = address;
        Latitude = latitude;
        Longitude = longitude;
        CityId = cityId;
        Slug = GenerateSlug(name);
        Status = status;
        IsFeatured = isFeatured;
        RejectionReason = rejectionReason;
        CreatedAtUtc = DateTime.UtcNow;
    }

    // ── Factory ───────────────────────────────────────────────────

    public static Result<Company> Create(
        Guid Id,
        Guid ownerId,
        string name,
        Guid cityId,
        string description,
        string Address,
        decimal ?Latitude,
        decimal? Longitude,
        IEnumerable<Guid> sectorIds)
    {
        var company = new Company(Id,ownerId,name,cityId,CompanyStatus.Draft,description,false,null,Address,Latitude,Longitude);


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
        IEnumerable<Guid> sectorIds)
    {
        Name = name;
        Slug = GenerateSlug(name);
        Description = description;
        Website = website;
        CityId = cityId;
        Address = address;
        Latitude = latitude;
        Longitude = longitude;

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

    public Result<Success> Reactivate()
    {
        if (Status != CompanyStatus.Suspended)
            return CompanyErrors.NotSuspended;

        Status = CompanyStatus.Active;
        return Result.Success;
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

    // ── Contacts ──────────────────────────────────────────────────

    public Result<Updated> AddContact(CompanyContact contact)
    {
        if(_contacts.Any(c => c.Type == contact.Type && c.Value == contact.Value))
            return CompanyErrors.ContactAlreadyExists;

        _contacts.Add(contact);
        return Result.Updated;
    }
    public Result<Updated> UpdateContact(Guid contactId, CompanyContact updatedContact)
    {
        var contact = _contacts.FirstOrDefault(c => c.Id == contactId);
        if (contact is null)
            return CompanyErrors.ContactNotFound;
        contact.Update(updatedContact.Type, updatedContact.Value,updatedContact.IsPrimary);
        return Result.Updated;
    }

    public Result<Updated> RemoveContact(Guid contactId)
    {
        var contact = _contacts.FirstOrDefault(c => c.Id == contactId);
        if (contact is null)
            return CompanyErrors.ContactNotFound;

        _contacts.Remove(contact);
        return Result.Updated;
    }
    // ── Services ──────────────────────────────────────────────────
    public Result<Updated> AddService(CompanyService service)
    {
        if(_services.Any(s => s.Title == service.Title))
            return CompanyErrors.ServiceAlreadyExists;
        _services.Add(service);
        return Result.Updated;
    }
    public Result<Updated> RemoveService(Guid serviceId)
    {
        var service = _services.FirstOrDefault(s => s.Id == serviceId);
        if (service is null)
            return CompanyErrors.ServiceNotFound;
        _services.Remove(service);
        return Result.Updated;
    }
    // ── Images ────────────────────────────────────────────────────

    public Result<Success> AddImage(string imageUrl, string? caption, Plan activePlan)
    {
        if (_images.Count >= activePlan.MaxImages)
            return CompanyErrors.ImageLimitReached;

        var order = _images.Count == 0 ? 1 : _images.Max(i => i.DisplayOrder) + 1;
        var image = CompanyImage.Create(Id, imageUrl, order, caption);
        _images.Add(image.Value);
        return Result.Success;
    }

    public Result<Success> RemoveImage(Guid imageId)
    {
        var image = _images.FirstOrDefault(i => i.Id == imageId);
        if (image is null)
            return CompanyErrors.ImageNotFound;

        _images.Remove(image);
        return Result.Success;
    }

    public Result<Updated> ReorderImages(List<(Guid ImageId, int Order)> orders)
    {
        foreach (var (imageId, order) in orders)
        {
            var image = _images.FirstOrDefault(i => i.Id == imageId);
            image?.UpdateOrder(order);
        }
        return Result.Updated;
    }

    // ── Documents ─────────────────────────────────────────────────

    public Result<Success> AddDocument(
        DocumentType docType,
        string fileUrl,
        bool isPublic,
        Plan activePlan)
    {
        if (_documents.Count >= activePlan.MaxDocuments)
            return CompanyErrors.DocumentLimitReached;

        var document = CompanyDocument.Create(Id, docType, fileUrl, isPublic);
        _documents.Add(document.Value);
        return Result.Success;
    }

    public Result<Success> RemoveDocument(Guid documentId)
    {
        var document = _documents.FirstOrDefault(d => d.Id == documentId);
        if (document is null)
            return CompanyErrors.DocumentNotFound;

        _documents.Remove(document);
        return Result.Success;
    }

    // ── Reports ───────────────────────────────────────────────────

    public Result<Success> AddReport(string reporterIp, string reason) {
        var report = CompanyReport.Create(Id, reporterIp, reason);
        _reports.Add(report.Value);
        return Result.Success;
    }

    // ── Helpers ───────────────────────────────────────────────────

    public Result<Success> IsOwnedBy(string userId)
    {
        if (OwnerId != Guid.Parse(userId))
            return CompanyErrors.NotOwner;

        return Result.Success;
    }

    private static string GenerateSlug(string name) =>
        System.Text.RegularExpressions.Regex.Replace(
            name.ToLowerInvariant()
                .Replace(" ", "-")
                .Replace("'", "")
                .Replace("&", "and"),
            @"[^a-z0-9\-]", "")
        .Trim('-');
}
