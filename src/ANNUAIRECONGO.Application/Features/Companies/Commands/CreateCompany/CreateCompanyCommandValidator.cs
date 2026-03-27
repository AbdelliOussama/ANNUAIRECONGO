using FluentValidation;

namespace ANNUAIRECONGO.Application.Features.Companies.Commands.CreateCompany;

public sealed class CreateCompanyCommandValidator : AbstractValidator<CreateCompanyCommand>
{
    public CreateCompanyCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.OwnerId).NotEmpty();
        RuleFor(x => x.CityId).NotEmpty();
        RuleFor(x => x.SectorIds).NotEmpty();
    }
}