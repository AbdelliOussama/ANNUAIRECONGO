using FluentValidation;

namespace ANNUAIRECONGO.Application.Features.Companies.Commands.StatusTransition.VerifyCompany;

public sealed class VerifyCompanyCommandValidator : AbstractValidator<VerifyCompanyCommand>
{
    public VerifyCompanyCommandValidator()
    {
        RuleFor(x => x.CompanyId).NotEmpty().WithMessage("Company Id is required.");
    }
}
