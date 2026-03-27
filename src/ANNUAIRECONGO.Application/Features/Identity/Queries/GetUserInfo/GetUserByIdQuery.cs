
using ANNUAIRECONGO.Application.Features.Identity.Dtos;
using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.Identity.Queries.GetUserInfo;
public sealed record GetUserByIdQuery : IRequest<Result<AppUserDto>>
{
    public string? UserId;
    public GetUserByIdQuery(string? userId)
    {
        UserId = userId;
    }

}