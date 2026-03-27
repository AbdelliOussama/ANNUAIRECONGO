using FluentValidation;

namespace ANNUAIRECONGO.Application.Features.Companies.Commands.StatusTransition.RejectCompany;
public sealed class RejectCompanyCommandValidator : AbstractValidator<RejectCompanyCommand>
{
    public RejectCompanyCommandValidator()
    {
        RuleFor(c => c.companyId).NotEmpty().NotNull().WithMessage("CompanyId is required");
        RuleFor(c => c.reason).NotEmpty().WithMessage("Rejection reason is required");
    }
}