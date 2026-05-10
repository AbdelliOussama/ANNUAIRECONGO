using FluentValidation;

namespace ANNUAIRECONGO.Application.Features.Companies.Queries.GetCompanyBySlugQuery;

public sealed class GetCompanyBySlugQueryValidator : AbstractValidator<GetCompanyBySlugQuery>
{
    public GetCompanyBySlugQueryValidator()
    {
        RuleFor(x => x.Slug)
            .NotEmpty()
            .WithMessage("Company slug is required.");
    }
}
