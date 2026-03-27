using FluentValidation;

namespace ANNUAIRECONGO.Application.Features.Sectors.Commands.DeleteSector;

public sealed class DeleteSectorCommandValidator :AbstractValidator<DeleteSectorCommand>
{
    public DeleteSectorCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("Sector Id is required.");
    }
}