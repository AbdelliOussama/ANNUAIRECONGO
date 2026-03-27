
using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Features.Identity.Dtos;
using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;

using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Identity.Queries.GetUserInfo;

public class GetUserByIdQueryHanlder : IRequestHandler<GetUserByIdQuery, Result<AppUserDto>>
{

    #region Fields
        private readonly ILogger<GetUserByIdQueryHanlder> _logger ;
        private readonly IIdentityService _identityService ;
    #endregion

    #region Constructor
        public GetUserByIdQueryHanlder(ILogger<GetUserByIdQueryHanlder>logger,IIdentityService identityService)
    {
        _identityService = identityService;
        _logger = logger;
    }
    #endregion

    public async Task<Result<AppUserDto>> Handle(GetUserByIdQuery request, CancellationToken ct)
    {
        var getUserByIdResult = await _identityService.GetUserByIdAsync(request.UserId!);

        if (getUserByIdResult.IsError)
        {
            _logger.LogError("User with Id { UserId }{ErrorDetails}", request.UserId, getUserByIdResult.TopError.Description);

            return getUserByIdResult.Errors;
        }

        return getUserByIdResult.Value;
    }
}