using ANNUAIRECONGO.Domain.Common.Results;
using FluentValidation;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.Identity.Commands.Register;

public sealed record RegisterCommand(
    string Email,
    string Password,
    string FirstName,
    string LastName,
    string PhoneNumber,
    string? CompanyPosition
) : IRequest<Result<Guid>>;

public sealed class RegisterCommandValidator : AbstractValidator<RegisterCommand>
{
    public RegisterCommandValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("A valid email is required.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required.")
            .MinimumLength(6).WithMessage("Password must be at least 6 characters long.");

        RuleFor(x => x.FirstName)
            .NotEmpty().WithMessage("First name is required.");

        RuleFor(x => x.LastName)
            .NotEmpty().WithMessage("Last name is required.");

        RuleFor(x => x.PhoneNumber)
            .NotEmpty().WithMessage("Phone number is required.");
    }
}

public sealed class RegisterCommandHandler(
    IRegistrationService registrationService) : IRequestHandler<RegisterCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        return await registrationService.RegisterAsync(
            request.Email,
            request.Password,
            request.FirstName,
            request.LastName,
            request.PhoneNumber,
            request.CompanyPosition,
            cancellationToken);
    }
}