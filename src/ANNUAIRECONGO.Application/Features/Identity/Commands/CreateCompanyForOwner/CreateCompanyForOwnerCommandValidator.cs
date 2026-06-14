using FluentValidation;

namespace ANNUAIRECONGO.Application.Features.Identity.Commands.CreateCompanyForOwner;

public sealed class CreateCompanyForOwnerCommandValidator
    : AbstractValidator<CreateCompanyForOwnerCommand>
{
    public CreateCompanyForOwnerCommandValidator()
    {
        // ── Owner contact info ────────────────────────────────────────────
        RuleFor(x => x.OwnerFirstName)
            .NotEmpty().WithMessage("Owner first name is required.")
            .MaximumLength(100).WithMessage("Owner first name cannot exceed 100 characters.");

        RuleFor(x => x.OwnerLastName)
            .NotEmpty().WithMessage("Owner last name is required.")
            .MaximumLength(100).WithMessage("Owner last name cannot exceed 100 characters.");

        RuleFor(x => x.OwnerPhone)
            .NotEmpty().WithMessage("Owner phone number is required.")
            .MaximumLength(20).WithMessage("Owner phone number cannot exceed 20 characters.");

        RuleFor(x => x.OwnerEmail)
            .NotEmpty().WithMessage("Owner email is required.")
            .EmailAddress().WithMessage("Owner email must be a valid email address.");

        RuleFor(x => x.OwnerPosition)
            .MaximumLength(100).WithMessage("Owner position cannot exceed 100 characters.")
            .When(x => x.OwnerPosition is not null);

        // ── Company data ──────────────────────────────────────────────────
        RuleFor(x => x.CompanyName)
            .NotEmpty().WithMessage("Company name is required.")
            .MaximumLength(100).WithMessage("Company name cannot exceed 100 characters.");

        RuleFor(x => x.CityId)
            .NotEqual(Guid.Empty).WithMessage("A city must be selected.");

        RuleFor(x => x.SectorIds)
            .NotEmpty().WithMessage("At least one sector must be selected.");

        RuleFor(x => x.Website)
            .MaximumLength(255).WithMessage("Website URL cannot exceed 255 characters.")
            .When(x => x.Website is not null);

        RuleFor(x => x.Rccm)
            .MaximumLength(100).WithMessage("RCCM cannot exceed 100 characters.")
            .When(x => x.Rccm is not null);

        RuleFor(x => x.Niu)
            .MaximumLength(100).WithMessage("NIU cannot exceed 100 characters.")
            .When(x => x.Niu is not null);
    }
}
