using FluentValidation;

namespace ANNUAIRECONGO.Application.Features.Companies.Queries.GetCompanyById;

public sealed class GetCompanyByIdQueryValidator :AbstractValidator<GetCompanyByIdQuery>
{
    public GetCompanyByIdQueryValidator()
    {
        RuleFor(x => x.id).NotEmpty().NotNull();
    }
}