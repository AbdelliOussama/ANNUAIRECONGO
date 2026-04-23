using ANNUAIRECONGO.Application.Features.Companies.Commands.CreateCreditRating;
using ANNUAIRECONGO.Domain.Companies;

namespace ANNUAIRECONGO.Application.Features.Companies.Mappers;

public static class CreditRatingMapper
{
    public static CreditRatingDto ToDto(this CreditRatingQuery creditRating)
    {
        return new CreditRatingDto
        {
            CompanyId = creditRating.CompanyId,
            UserId = creditRating.UserId,
            Reason = creditRating.Reason,
            CreditRating = creditRating.Result,
            RequestedAt = creditRating.RequestedAt,
            AmountCharged = creditRating.AmountCharged
        };
    }
    public static List<CreditRatingDto> ToDTos(this IEnumerable<CreditRatingQuery> creditRatings)
    {
        return [..creditRatings.Select(cr => ToDto(cr))];
    }
}