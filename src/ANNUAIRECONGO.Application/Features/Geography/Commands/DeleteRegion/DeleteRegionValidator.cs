using FluentValidation;

namespace ANNUAIRECONGO.Application.Features.Geography.Commands.DeleteRegion;
public class DeleteRegionValidator : AbstractValidator<DeleteRegionCommand>
{
    public DeleteRegionValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Region ID is required.");
    }
}