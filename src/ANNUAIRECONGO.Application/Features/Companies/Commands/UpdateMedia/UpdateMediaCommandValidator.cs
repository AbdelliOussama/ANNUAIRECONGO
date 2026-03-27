using FluentValidation;

namespace ANNUAIRECONGO.Application.Features.Companies.Commands.UpdateMedia;

public sealed class UpdateMediaCommandValidator : AbstractValidator<UpdateMediaCommand>
{
    public UpdateMediaCommandValidator()
    {
        RuleFor(x => x.id).NotEmpty().WithMessage("Id is required.");
        RuleFor(x => x.logoUrl).NotEmpty().WithMessage("Logo URL is required.");
        RuleFor(x => x.coverUrl).NotEmpty().WithMessage("Cover URL is required.");
    }
}