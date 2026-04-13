using ANNUAIRECONGO.Application.Features.Companies.Dtos;
using ANNUAIRECONGO.Application.Features.Companies.Dtos.Services;
using ANNUAIRECONGO.Application.Features.Sectors.Dtos;
using ANNUAIRECONGO.Application.Features.Sectors.Mappers;
using ANNUAIRECONGO.Domain.Companies;

namespace ANNUAIRECONGO.Application.Features.Companies.Mappers;
public static class CompanyMapper
{
    public static CompanyDto ToDto(this Company company)
    {
        return new CompanyDto
        {
            Id = company.Id,
            OwnerId = company.OwnerId,
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
            CityName = company.City.Name,
            RegionName = company.City.Region.Name,
            Status = company.Status,
            RejectionReason = company.RejectionReason,
            IsFeatured = company.IsFeatured,
            ActiveSubscriptionId = company.ActiveSubscriptionId,
            Sectors = company.CompanySectors.Select(cs => cs.Sector.ToDto()).ToList(),
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
    public static List<CompanyDto> ToDTos(this IEnumerable<Company> companies)
    {
        return [..companies.Select(c => c.ToDto())];
    }
}