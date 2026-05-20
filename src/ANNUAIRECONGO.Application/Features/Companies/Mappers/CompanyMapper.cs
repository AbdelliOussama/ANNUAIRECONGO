using ANNUAIRECONGO.Application.Features.Companies.Dtos;
using ANNUAIRECONGO.Application.Features.Companies.Dtos.Services;
using ANNUAIRECONGO.Application.Features.Geography.Dtos;
using ANNUAIRECONGO.Application.Features.Sectors.Mappers;
using ANNUAIRECONGO.Application.Features.Subscriptions.Mappers;
using ANNUAIRECONGO.Domain.Companies;

namespace ANNUAIRECONGO.Application.Features.Companies.Mappers;

public static class CompanyMapper
{
    public static CompanyDto ToDto(this Company company)
    {
        // Locate the active subscription if it has been .Include()d on the query.
        // If the navigation collection wasn't loaded the field stays null and
        // the FE falls back to the flat ActiveSubscriptionId — no over-fetching.
        var activeSub = company.ActiveSubscriptionId.HasValue
            ? company.Subscriptions?.FirstOrDefault(s => s.Id == company.ActiveSubscriptionId.Value)
            : null;

        return new CompanyDto
        {
            Id = company.Id,
            OwnerId = company.OwnerId,
            OwnerName = company.Owner?.FullName,
            OwnerPhone = company.Owner?.Phone,
            Name = company.Name,
            Slug = company.Slug,
            Description = company.Description,
            LogoUrl = company.LogoUrl,
            CoverUrl = company.CoverUrl,
            Website = company.Website,
            CityId = company.CityId,
            Address = company.Address,
            Latitude = company.Latitude,
            Longitude = company.Longitude,
            CityName = company.City?.Name,
            RegionName = company.City?.Region?.Name,

            // Audit fix #1 — nested City object the FE templates can bind to
            // (e.g. {{ company.city.name }} or *ngIf="company.city").
            City = company.City is null ? null : new CityDto
            {
                Id = company.City.Id,
                Name = company.City.Name,
                RegionId = company.City.RegionId,
            },

            Status = company.Status,
            RejectionReason = company.RejectionReason,
            IsFeatured = company.IsFeatured,
            IsVerified = company.IsVerified,
            IsPremium = company.IsPremium,
            TrustScore = company.TrustScore,
            TrustScoreAnalysis = company.TrustScoreAnalysis,
            SubmittedAt = company.SubmittedAt,
            Rccm = company.Rccm,
            Niu = company.Niu,
            YearFounded = company.YearFounded,
            CreatedAtUtc = company.CreatedAtUtc,
            LastModifiedUtc = company.LastModifiedUtc,
            ActiveSubscriptionId = company.ActiveSubscriptionId,

            // Audit fix #4 — nested SubscriptionDto so the espace console doesn't
            // need a second round-trip to render the current plan.
            ActiveSubscription = activeSub?.ToDto(),

            Sectors = company.CompanySectors?
                .Where(cs => cs.Sector != null)
                .Select(cs => cs.Sector.ToDto())
                .ToList() ?? [],
            Services = company.Services.Select(s => new ServiceDto
            {
                Id = s.Id,
                CompanyId = s.CompanyId,
                Title = s.Title,
                Description = s.Description
            }).ToList(),
            Contacts = company.Contacts.Select(c => new ContactDto
            {
                Id = c.Id,
                CompanyId = c.CompanyId,
                Type = c.Type,
                Value = c.Value,
                IsPrimary = c.IsPrimary
            }).ToList(),
            Images = company.Images.Select(i => new CompanyImageDto
            {
                Id = i.Id,
                CompanyId = i.CompanyId,
                ImageUrl = i.ImageUrl,
                Caption = i.Caption,
                DisplayOrder = i.DisplayOrder,
                UploadedAt = i.UploadedAt
            }).ToList(),
            Documents = company.Documents.Select(d => new DocumentDto
            {
                Id = d.Id,
                CompanyId = d.CompanyId,
                DocType = d.DocType,
                FileUrl = d.FileUrl,
                IsPublic = d.IsPublic,
                UploadedAt = d.UploadedAt
            }).ToList()
        };
    }

    public static List<CompanyDto> ToDtoList(this IEnumerable<Company> companies)
    {
        return [..companies.Select(c => c.ToDto())];
    }
}
