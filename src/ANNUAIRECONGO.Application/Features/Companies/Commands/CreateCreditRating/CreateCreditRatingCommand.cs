using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Companies.Enums;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.Companies.Commands.CreateCreditRating;

public sealed record CreateCreditRatingCommand : IRequest<Result<CreditRatingDto>>
{
    public Guid CompanyId { get; init; }
    public string? Reason { get; init; }
    public CreditRating creditRating { get; set; }
    public decimal? AmountCharged { get; init; }
}
