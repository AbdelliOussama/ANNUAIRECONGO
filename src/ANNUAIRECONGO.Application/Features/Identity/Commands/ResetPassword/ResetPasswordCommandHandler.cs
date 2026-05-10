using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.Identity.Commands.ResetPassword;

public sealed class ResetPasswordCommandHandler(IIdentityService identityService) : IRequestHandler<ResetPasswordCommand, Result<Success>>
{
    public async Task<Result<Success>> Handle(ResetPasswordCommand request, CancellationToken cancellationToken)
    {
        return await identityService.ResetPasswordAsync(request.Email, request.Token, request.NewPassword, cancellationToken);
    }
}
