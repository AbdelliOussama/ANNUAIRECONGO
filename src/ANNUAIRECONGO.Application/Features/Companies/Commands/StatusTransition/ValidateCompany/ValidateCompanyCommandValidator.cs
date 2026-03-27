using FluentValidation;

namespace ANNUAIRECONGO.Application.Features.Companies.Commands.StatusTransition.ValidateCompany;

public sealed class ValidateCompanyCommandValidator : AbstractValidator<ValidateCompanyCommand>
{
    public ValidateCompanyCommandValidator()
    {
        RuleFor(x => x.CompanyId).NotEmpty().WithMessage("Company Id is required.");
    }
}