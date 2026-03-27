using FluentValidation;

namespace ANNUAIRECONGO.Application.Features.Companies.Commands.Contacts.AddContact;

public sealed class AddContactCommandValidator : AbstractValidator<AddContactCommand>
{
    public AddContactCommandValidator()
    {
        RuleFor(x => x.CompanyId).NotEmpty().WithMessage("CompanyId is required");
        RuleFor(x => x.Type).NotEmpty().WithMessage("Type is required");
        RuleFor(x => x.Value).NotEmpty().WithMessage("Value is required");
    }
}