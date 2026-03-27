using FluentValidation;

namespace ANNUAIRECONGO.Application.Features.Companies.Commands.StatusTransition.SubmitCompany;
public sealed class SubmitCompanyCommandValidator : AbstractValidator<SubmitCompanyCommand>
{
    public SubmitCompanyCommandValidator()
    {
        RuleFor(c =>c.companyId).NotEmpty().NotNull().WithMessage("CompanyId is required");
    }
}