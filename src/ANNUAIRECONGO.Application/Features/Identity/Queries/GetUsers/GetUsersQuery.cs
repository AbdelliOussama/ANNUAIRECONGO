using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Features.Identity.Dtos;
using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.Identity.Queries.GetUsers;

public record GetUsersQuery : IRequest<Result<List<AppUserDto>>>;

public class GetUsersQueryHandler(IIdentityService identityService) : IRequestHandler<GetUsersQuery, Result<List<AppUserDto>>>
{
    public Task<Result<List<AppUserDto>>> Handle(GetUsersQuery request, CancellationToken cancellationToken)
    {
        return identityService.GetAllUsersAsync(cancellationToken);
    }
}
