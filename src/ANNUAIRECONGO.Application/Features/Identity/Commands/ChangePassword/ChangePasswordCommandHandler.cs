using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Identity;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.Identity.Commands.ChangePassword;

public sealed class ChangePasswordCommandHandler(IIdentityService identityService, IUser currentUser)
    : IRequestHandler<ChangePasswordCommand, Result<Success>>
{
    public async Task<Result<Success>> Handle(ChangePasswordCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(currentUser.Id))
            return IdentityErrors.UserNotFound;

        return await identityService.ChangePasswordAsync(
            currentUser.Id,
            request.CurrentPassword,
            request.NewPassword,
            cancellationToken);
    }
}
