using ANNUAIRECONGO.Application.Features.Companies.Dtos;
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
            CityId = company.CityId,
            Status = company.Status,
            IsFeatured = company.IsFeatured,
            RejectionReason = company.RejectionReason
        };
    }
    public static List<CompanyDto> ToDTos(this IEnumerable<Company> companies)
    {
        return [..companies.Select(c => c.ToDto())];
    }
}