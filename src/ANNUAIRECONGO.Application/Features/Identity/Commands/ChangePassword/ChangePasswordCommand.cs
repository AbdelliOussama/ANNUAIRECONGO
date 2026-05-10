using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.Identity.Commands.ChangePassword;

/// <summary>
/// Changes the connected user's password. The handler resolves the user id
/// from <see cref="IUser"/> so the FE doesn't need to send it.
/// </summary>
public sealed record ChangePasswordCommand(string CurrentPassword, string NewPassword) : IRequest<Result<Success>>;
