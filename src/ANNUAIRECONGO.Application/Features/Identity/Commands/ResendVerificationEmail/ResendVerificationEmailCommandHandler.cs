using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.Identity.Commands.ResendVerificationEmail;

public sealed class ResendVerificationEmailCommandHandler(IIdentityService identityService)
    : IRequestHandler<ResendVerificationEmailCommand, Result<Success>>
{
    public async Task<Result<Success>> Handle(ResendVerificationEmailCommand request, CancellationToken cancellationToken)
    {
        return await identityService.ResendVerificationEmailAsync(request.Email, cancellationToken);
    }
}
