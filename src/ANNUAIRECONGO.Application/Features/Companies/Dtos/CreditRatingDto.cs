using ANNUAIRECONGO.Domain.Companies.Enums;

namespace ANNUAIRECONGO.Application.Features.Companies.Commands.CreateCreditRating;

public class CreditRatingDto
{
    public Guid CompanyId { get; set; }
    public string? UserId { get; set; }
    public string? Reason { get; set; }
    public CreditRating CreditRating { get; set; }
    public DateTimeOffset RequestedAt { get; set; }
    public decimal? AmountCharged { get; set; }
}