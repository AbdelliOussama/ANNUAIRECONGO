using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.Identity.Commands.ForgotPassword;

public sealed class ForgotPasswordCommandHandler(IIdentityService identityService) : IRequestHandler<ForgotPasswordCommand, Result<Success>>
{
    public async Task<Result<Success>> Handle(ForgotPasswordCommand request, CancellationToken cancellationToken)
    {
        return await identityService.ForgotPasswordAsync(request.Email, cancellationToken);
    }
}
