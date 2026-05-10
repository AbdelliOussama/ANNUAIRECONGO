using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.Identity.Commands.VerifyEmail;

public sealed class VerifyEmailCommandHandler(IIdentityService identityService)
    : IRequestHandler<VerifyEmailCommand, Result<Success>>
{
    public async Task<Result<Success>> Handle(VerifyEmailCommand request, CancellationToken cancellationToken)
    {
        return await identityService.VerifyEmailAsync(request.Email, request.Token, cancellationToken);
    }
}
