using FluentValidation;

namespace ANNUAIRECONGO.Application.Features.Companies.Commands.StatusTransition.SuspendCompnay;
public sealed class SuspendCompanyCommandValidator : AbstractValidator<SuspendCompanyCommand>
{
    public SuspendCompanyCommandValidator()
    {
        RuleFor(c => c.companyId).NotEmpty().NotNull().WithMessage("CompanyId is required");
    }
}