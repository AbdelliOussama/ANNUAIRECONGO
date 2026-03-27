using ANNUAIRECONGO.Application.Features.BusinessOwners.Dtos;
using ANNUAIRECONGO.Domain.BusinessOwners;

namespace ANNUAIRECONGO.Application.Features.BusinessOwners.Mappers;

public static class BusinessOwnerMapper
{
    public static BusinessOwnerDto ToDto(this BusinessOwner businessOwner)
    {
        return new BusinessOwnerDto
        {
            BusinessOwnerId = businessOwner.Id,
            FirstName = businessOwner.FirstName,
            LastName = businessOwner.LastName,
            Phone = businessOwner.Phone
        };
    }
    public static List<BusinessOwnerDto> ToDtos(this IEnumerable<BusinessOwner> businessOwners)
    {
        return [.. businessOwners.Select(b=>b.ToDto())];
    }
}
