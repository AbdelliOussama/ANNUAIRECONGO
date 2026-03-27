using FluentValidation;

namespace ANNUAIRECONGO.Application.Features.Companies.Commands.StatusTransition.ReactivateCompany;
public sealed class ReactivateCompanyCommandValidator : AbstractValidator<ReactivateCompanyCommand>
{
    public ReactivateCompanyCommandValidator()
    {
        RuleFor(c => c.companyId).NotEmpty().NotNull().WithMessage("CompanyId is required");
    }
}