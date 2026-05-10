using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.Identity.Commands.DeleteAccount;

/// <summary>
/// Permanently deletes the connected user's account. The associated
/// BusinessOwner row is also removed; companies owned by the user are
/// detached so an admin can re-assign or archive them.
/// </summary>
public sealed record DeleteAccountCommand : IRequest<Result<Success>>;
