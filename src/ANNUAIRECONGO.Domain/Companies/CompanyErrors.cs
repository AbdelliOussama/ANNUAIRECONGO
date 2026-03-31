
using ANNUAIRECONGO.Domain.Common.Results;

namespace ANNUAIRECONGO.Domain.Companies;

public static class CompanyErrors
{
    // ── Not Found ─────────────────────────────────────────────────
    public static Error CompanyNotFound(Guid id) => Error.NotFound(
        "Company.NotFound",
        $"Company with id '{id}' was not found.");

    public static Error NameAlreadyExists(string name) => Error.Conflict(
        "Company.NameAlreadyExists",
        $"Company with name '{name}' already exists.");

    public static Error CompanyWithoutSubscription(Guid companyId) => Error.Conflict(
        "Company.WithoutSubscription",
        $"Company with id '{companyId}' does not have a subscription plan.");



    public static readonly Error NotFoundBySlug = Error.NotFound(
        "Company.NotFoundBySlug",
        "Company with this slug was not found.");

    // ── Ownership ─────────────────────────────────────────────────
    public static readonly Error NotOwner = Error.Forbidden(
        "Company.NotOwner",
        "You are not the owner of this company.");

    // ── Status Transitions ────────────────────────────────────────
    public static readonly Error NotInDraft = Error.Conflict(
        "Company.NotInDraft",
        "Company must be in Draft status to be submitted.");

    public static readonly Error NotPending = Error.Conflict(
        "Company.NotPending",
        "Company must be in Pending status for this operation.");

    public static readonly Error NotActive = Error.Conflict(
        "Company.NotActive",
        "Company must be Active for this operation.");

    public static readonly Error NotSuspended = Error.Conflict(
        "Company.NotSuspended",
        "Company must be Suspended to be reactivated.");

    public static readonly Error RejectionReasonRequired = Error.Validation(
        "Company.RejectionReasonRequired",
        "A rejection reason must be provided.");

    // ── Slug ──────────────────────────────────────────────────────
    public static readonly Error SlugAlreadyExists = Error.Conflict(
        "Company.SlugAlreadyExists",
        "A company with this name already exists.");

    // ── Contacts ──────────────────────────────────────────────────
    public static readonly Error ContactNotFound = Error.NotFound(
        "Company.ContactNotFound",
        "Contact was not found on this company.");

    // ── Services ──────────────────────────────────────────────────
    public static readonly Error ServiceNotFound = Error.NotFound(
        "Company.ServiceNotFound",
        "Service was not found on this company.");

    // ── Images ────────────────────────────────────────────────────
    public static readonly Error ImageNotFound = Error.NotFound(
        "Company.ImageNotFound",
        "Image was not found on this company.");

    public static readonly Error ImageLimitReached = Error.Conflict(
        "Company.ImageLimitReached",
        "You have reached the maximum number of images allowed by your plan.");

    // ── Documents ─────────────────────────────────────────────────
    public static readonly Error DocumentNotFound = Error.NotFound(
        "Company.DocumentNotFound",
        "Document was not found on this company.");

    public static readonly Error DocumentLimitReached = Error.Conflict(
        "Company.DocumentLimitReached",
        "You have reached the maximum number of documents allowed by your plan.");

    public static Error NoCompaniesFound  = Error.NotFound(
        "Company.NoCompaniesFound",
        "No companies were found.");

    public static Error ServiceTitleRequired  = Error.Validation(
        "Company.ServiceTitleRequired",
        "Service title is required.");

    public static Error ServiceAlreadyExists = Error.Conflict(
        "Company.ServiceAlreadyExists",
        "A service with this title already exists.");

    public static Error ContactAlreadyExists = Error.Conflict(
        "Company.ContactAlreadyExists",
        "A contact with this value already exists.");

    public static Error FileUrlRequired = Error.Validation(
        "Company.FileUrlRequired",
        "File URL is required.");

    public static Error ImageUrlRequired = Error.Validation(
        "Company.ImageUrlRequired",
        "Image URL is required.");

    public static Error ReporterIpRequired = Error.Validation(
        "Company.ReporterIpRequired",
        "Reporter IP is required.");
    public static Error ReasonRequired = Error.Validation(
        "Company.ReasonRequired",
        "Reason is required.");

}
