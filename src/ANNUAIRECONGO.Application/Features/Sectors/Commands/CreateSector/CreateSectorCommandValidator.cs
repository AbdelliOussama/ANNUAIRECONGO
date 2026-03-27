using FluentValidation;

namespace ANNUAIRECONGO.Application.Features.Sectors.Commands.CreateSector;

public sealed class CreateSectorCommandValidator  : AbstractValidator<CreateSectorCommand>
{
    public CreateSectorCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().MaximumLength(50);

        RuleFor(x => x.Description)
            .NotEmpty().MaximumLength(50);
    }
}