using FluentValidation;

namespace ANNUAIRECONGO.Application.Features.Companies.Commands.Contacts.UpdateContact;

public sealed class UpdateContactCommandValidator : AbstractValidator<UpdateContactCommand>
{
    public UpdateContactCommandValidator()
    {
        RuleFor(x => x.CompanyId).NotEmpty().WithMessage("CompanyId is required");
        RuleFor(x => x.ContactId).NotEmpty().WithMessage("ContactId is required");
        RuleFor(x => x.Type).NotEmpty().WithMessage("Type is required");
        RuleFor(x => x.Value).NotEmpty().WithMessage("Value is required");
    }
}