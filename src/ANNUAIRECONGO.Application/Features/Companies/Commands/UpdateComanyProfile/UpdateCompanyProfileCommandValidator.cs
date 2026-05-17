using FluentValidation;
using FluentValidation.Validators;

namespace ANNUAIRECONGO.Application.Features.Companies.Commands.UpdateComanyProfile;

public sealed class UpdateCompanyProfileCommandValidator : AbstractValidator<UpdateCompanyProfileCommand>
{
    public UpdateCompanyProfileCommandValidator()
    {
        RuleFor(c => c.name).NotEmpty().NotNull().WithMessage("Name is required");
        RuleFor(c => c.cityId).NotEmpty().NotNull().WithMessage("CityId is required");
        RuleFor(c => c.address).NotEmpty().NotNull().WithMessage("Address is required");
        RuleFor(c => c.sectorIds).NotEmpty().NotNull().WithMessage("SectorIds is required");
        RuleFor(c => c.sectorIds).Must(BeUnique).WithMessage("SectorIds must be unique");
        
        // Rule for email removed to isolate validation error source
    }

    private bool BeUnique(IEnumerable<Guid> enumerable)
    {
        return enumerable.Distinct().Count() == enumerable.Count();
    }
}
