using FluentValidation;

namespace ANNUAIRECONGO.Application.Features.Companies.Commands.PlanManagment.SetActiveSubscription;

public sealed class SetActiveSubscriptionCommandValidator : AbstractValidator<SetActiveSubscriptionCommand>
{
    public SetActiveSubscriptionCommandValidator()
    {
        RuleFor(x => x.CompanyId).NotEmpty().WithMessage("CompanyId is required.");
        RuleFor(x => x.SubscriptionId).NotEmpty().WithMessage("SubscriptionId is required.");
    }
}