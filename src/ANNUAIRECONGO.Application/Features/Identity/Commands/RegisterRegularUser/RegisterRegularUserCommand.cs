using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.Identity.Commands.RegisterRegularUser;

/// <summary>
/// Registers a new user in the <c>RegularUser</c> role.
/// No company is created; the user can later subscribe to a plan via
/// <c>POST /user-subscriptions/subscribe</c>.
/// </summary>
public sealed record RegisterRegularUserCommand(
    string Email,
    string Password,
    string FirstName,
    string LastName,
    string PhoneNumber
) : IRequest<Result<Guid>>;
