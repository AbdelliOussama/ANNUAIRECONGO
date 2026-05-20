using ANNUAIRECONGO.Domain.Companies.Enums;
using ANNUAIRECONGO.Application.Features.Sectors.Dtos;
using ANNUAIRECONGO.Application.Features.Companies.Dtos.Services;
using ANNUAIRECONGO.Application.Features.Geography.Dtos;
using ANNUAIRECONGO.Application.Features.Subscriptions.Dtos;
using System.Text.Json.Serialization;

namespace ANNUAIRECONGO.Application.Features.Companies.Dtos;

/// <summary>
/// Read model returned by the Companies API. Field names align with the
/// Angular <c>Company</c> interface so the JSON contract is 1:1 with the
/// frontend.
///
/// Audit fixes (May 2026 deep audit):
///   #1  <see cref="City"/> nested object added — FE templates read company.city.{id,name}.
///   #2  <see cref="CreatedAtUtc"/> serialized as JSON "createdAt".
///   #3  <see cref="LastModifiedUtc"/> serialized as JSON "updatedAt".
///   #4  <see cref="ActiveSubscription"/> nested object added — espace console reads it.
/// </summary>
public class CompanyDto
{
    public Guid Id { get; set; }
    public Guid? OwnerId { get; set; }
    public string? OwnerName { get; set; }
    public string? OwnerPhone { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }

    // Media
    public string? LogoUrl { get; set; }
    public string? CoverUrl { get; set; }
    [JsonPropertyName("websiteUrl")]
    public string? Website { get; set; }

    // Location — keep flat fields for backwards-compatible binding AND
    // expose a nested CityDto for templates that prefer it (audit #1).
    public Guid CityId { get; set; }
    public string? Address { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public string? CityName { get; set; }
    public string? RegionName { get; set; }
    public CityDto? City { get; set; }

    // Status
    public CompanyStatus Status { get; set; }
    public string? RejectionReason { get; set; }
    public bool IsFeatured { get; set; }
    public bool IsVerified { get; set; }
    public bool IsPremium { get; set; }
    public int TrustScore { get; set; }
    public string? TrustScoreAnalysis { get; set; }

    [JsonPropertyName("submittedAt")]
    public DateTime? SubmittedAt { get; set; }

    // Identity / metadata
    public string? Rccm { get; set; }
    public string? Niu { get; set; }
    public int? YearFounded { get; set; }

    // Audit timestamps — JSON names mirror the FE Company interface (audit #2 / #3).
    [JsonPropertyName("createdAt")]
    public DateTimeOffset CreatedAtUtc { get; set; }

    [JsonPropertyName("updatedAt")]
    public DateTimeOffset LastModifiedUtc { get; set; }

    // Subscription — flat id kept; nested DTO added so FE doesn't have
    // to make a second round-trip (audit #4).
    public Guid? ActiveSubscriptionId { get; set; }
    public SubscriptionDto? ActiveSubscription { get; set; }

    // Collections
    public List<SectorDto> Sectors { get; set; } = new();
    public List<ServiceDto> Services { get; set; } = new();
    public List<DocumentDto> Documents { get; set; } = new();
    public List<CompanyImageDto> Images { get; set; } = new();
    public List<ContactDto> Contacts { get; set; } = new();
}
