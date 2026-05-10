using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Identity;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.Identity.Commands.DeleteAccount;

public sealed class DeleteAccountCommandHandler(IIdentityService identityService, IUser currentUser)
    : IRequestHandler<DeleteAccountCommand, Result<Success>>
{
    public async Task<Result<Success>> Handle(DeleteAccountCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(currentUser.Id))
            return IdentityErrors.UserNotFound;

        return await identityService.DeleteAccountAsync(currentUser.Id, cancellationToken);
    }
}
