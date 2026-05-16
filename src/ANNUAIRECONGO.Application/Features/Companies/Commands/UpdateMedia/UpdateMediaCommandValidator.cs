using FluentValidation;

namespace ANNUAIRECONGO.Application.Features.Companies.Commands.UpdateMedia;

public sealed class UpdateMediaCommandValidator : AbstractValidator<UpdateMediaCommand>
{
    public UpdateMediaCommandValidator()
    {
        RuleFor(x => x.id).NotEmpty().WithMessage("Id is required.");
        // Both are optional now, only validate if provided
        RuleFor(x => x.logoUrl).MaximumLength(500);
        RuleFor(x => x.coverUrl).MaximumLength(500);
    }
}
