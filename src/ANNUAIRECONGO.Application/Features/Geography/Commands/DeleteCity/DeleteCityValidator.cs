using FluentValidation;

namespace ANNUAIRECONGO.Application.Features.Geography.Commands.DeleteCity;
public class DeleteCityValidator : AbstractValidator<DeleteCityCommand>
{
    public DeleteCityValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("City ID is required.");
    }
}