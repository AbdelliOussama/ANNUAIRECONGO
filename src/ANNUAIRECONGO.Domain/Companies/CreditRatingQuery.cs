using ANNUAIRECONGO.Domain.Common;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Companies.Enums;

namespace ANNUAIRECONGO.Domain.Companies;

public class CreditRatingQuery : Entity
{
    public Guid CompanyId { get;private set; }
    public string? UserId { get;private set; }
    public string? Reason { get; private set; }
    public CreditRating Result { get; private set; }
    public DateTimeOffset RequestedAt { get; private set; }
    public decimal? AmountCharged { get; private set; }

    private CreditRatingQuery() { }
    private CreditRatingQuery(Guid companyId, string? userId, string? reason, CreditRating result, DateTimeOffset requestedAt, decimal? amountCharged)
    {
        CompanyId = companyId;
        UserId = userId;
        Reason = reason;
        Result = result;
        RequestedAt = requestedAt;
        AmountCharged = amountCharged;
    }
    public static Result<CreditRatingQuery> Create(Guid companyId, string? userId, string? reason, CreditRating result, DateTimeOffset requestedAt, decimal? amountCharged)
    {
        if (companyId == Guid.Empty)
            return CompanyErrors.CompanyNotFound(companyId);

        if (string.IsNullOrWhiteSpace(reason))
            return CompanyErrors.ReasonRequired;
        return new CreditRatingQuery(companyId, userId, reason, result, requestedAt, amountCharged);
    }

}