using FluentValidation;

namespace ANNUAIRECONGO.Application.Features.Companies.Commands.PlanManagment.SetFeatured;

public sealed class SetFeatureCommandValidator : AbstractValidator<SetFeatureCommand>
{
    public SetFeatureCommandValidator()
    {
        RuleFor(x => x.CompanyId).NotEmpty().WithMessage("Company Id Is Required");
        RuleFor(x =>x.IsFeatured).NotEmpty().WithMessage("Is Featured Is Required");
    }
}