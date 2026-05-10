using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.Identity.Commands.UpdateProfile;

public sealed record UpdateProfileCommand(
    string FirstName,
    string LastName,
    string PhoneNumber,
    string? CompanyPosition) : IRequest<Result<Success>>;

public sealed class UpdateProfileCommandHandler(IIdentityService identityService, IUser currentUser)
    : IRequestHandler<UpdateProfileCommand, Result<Success>>
{
    public async Task<Result<Success>> Handle(UpdateProfileCommand request, CancellationToken ct)
    {
        if (string.IsNullOrEmpty(currentUser.Id))
        {
            return ANNUAIRECONGO.Domain.Identity.IdentityErrors.UserNotFound;
        }

        return await identityService.UpdateProfileAsync(
            currentUser.Id,
            request.FirstName,
            request.LastName,
            request.PhoneNumber,
            request.CompanyPosition,
            ct);
    }
}
