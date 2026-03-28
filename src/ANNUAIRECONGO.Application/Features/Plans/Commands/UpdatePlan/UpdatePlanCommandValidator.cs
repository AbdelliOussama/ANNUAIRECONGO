using FluentValidation;

namespace ANNUAIRECONGO.Application.Features.Plans.Commands.UpdatePlan;

public sealed class UpdatePlanCommandValidator : AbstractValidator<UpdatePlanCommand>
{
    public UpdatePlanCommandValidator()
    {
        RuleFor(x =>x.Name)
            .NotEmpty().WithMessage("Plan name is required.")
            .IsInEnum().WithMessage("Invalid plan name.");

        RuleFor(x => x.Price)
            .GreaterThanOrEqualTo(0).WithMessage("Price must be a non-negative value.");

        RuleFor(x => x.DurationDays)
            .GreaterThan(0).WithMessage("Duration must be greater than zero.");

        RuleFor(x => x.SearchPriority)
            .InclusiveBetween(1, 3).WithMessage("Search priority must be between 1 and 3.");
    }
}