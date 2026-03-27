using FluentValidation;

namespace ANNUAIRECONGO.Application.Features.Sectors.Queries.GetSectorById;

public sealed class GetSectorByIdQueryValidator : AbstractValidator<GetSectorByIdQuery>
{
    public GetSectorByIdQueryValidator()
    {
        RuleFor(request => request.sectorId)
            .NotEmpty()
            .WithErrorCode("SectorId_Is_Required")
            .WithMessage("SectorId is required.");
    }
}