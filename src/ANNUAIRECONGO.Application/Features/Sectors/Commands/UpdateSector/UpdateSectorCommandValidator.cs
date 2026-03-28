using FluentValidation;

namespace ANNUAIRECONGO.Application.Features.Sectors.Commands.UpdateSector;

public sealed class UpdateSectorCommandValidator : AbstractValidator<UpdateSectorCommand>
{
    public UpdateSectorCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().MaximumLength(50);
    }
}