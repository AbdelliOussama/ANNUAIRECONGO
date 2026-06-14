using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.Identity.Commands.CreateCompanyForOwner;

/// <summary>
/// Command for an Admin to create a company on behalf of a passive business owner
/// who has no system account. A <see cref="Domain.BusinessOwners.BusinessOwner"/> contact
/// record and a <see cref="Domain.Companies.Company"/> are created atomically.
/// No Identity user is created — the owner's data is stored as contact info only.
/// </summary>
public sealed record CreateCompanyForOwnerCommand(
    // ── Owner contact info ────────────────────────────────────────────────
    string  OwnerFirstName,
    string  OwnerLastName,
    string  OwnerPhone,
    string  OwnerEmail,
    string? OwnerPosition,
    // ── Company data ──────────────────────────────────────────────────────
    string     CompanyName,
    Guid       CityId,
    List<Guid> SectorIds,
    string?    Website,
    string?    Rccm,
    string?    Niu
) : IRequest<Result<Guid>>;
