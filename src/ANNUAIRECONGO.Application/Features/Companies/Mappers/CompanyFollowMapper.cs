using ANNUAIRECONGO.Application.Features.Companies.Dtos;
using ANNUAIRECONGO.Domain.Companies;

namespace ANNUAIRECONGO.Application.Features.Companies.Mappers;

public static class CompanyFollowMapper
{
    public static CompanyFollowDto ToDto(this CompanyFollow companyFollow)
    {
        return new CompanyFollowDto
        {
            CompanyId = companyFollow.CompanyId,
            UserId = companyFollow.UserId,
            FollowedAt = companyFollow.FollowedAt,
            LastCheckedAt = companyFollow.LastCheckedAt,
            IsEmailEnabled = companyFollow.IsEmailEnabled
        };
    }
    public static List<CompanyFollowDto> ToDTos(this IEnumerable<CompanyFollow> companyFollows)
    {
        return [..companyFollows.Select(cf => cf.ToDto())];
    }
}