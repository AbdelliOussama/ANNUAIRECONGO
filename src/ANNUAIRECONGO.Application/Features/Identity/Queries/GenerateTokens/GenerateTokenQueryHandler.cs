using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Features.Identity.Queries.GenerateTokens;
using ANNUAIRECONGO.Domain.Common.Results;

using MediatR;

using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Identity.Queries.GenerateTokens;

public class GenerateTokenQueryHandler : IRequestHandler<GenerateTokenQuery, Result<TokenResponse>>
{
    private readonly ILogger<GenerateTokenQueryHandler> _logger ;
    private readonly IIdentityService _identityService ;
    private readonly ITokenProvider _tokenProvider ;

    #region Constructor
    public GenerateTokenQueryHandler(ILogger<GenerateTokenQueryHandler> logger, IIdentityService identityService, ITokenProvider tokenProvider)
    {
        _identityService =identityService;
        _logger = logger;
        _tokenProvider = tokenProvider;
    }
    #endregion

    public async Task<Result<TokenResponse>> Handle(GenerateTokenQuery query, CancellationToken ct)
    {
        var userResponse = await _identityService.AuthenticateAsync(query.Email, query.Password);

        if (userResponse.IsError)
        {
            return userResponse.Errors;
        }

        var generateTokenResult = await _tokenProvider.GenerateJwtTokenAsync(userResponse.Value, ct);

        if (generateTokenResult.IsError)
        {
            _logger.LogError("Generate token error occurred: {ErrorDescription}", generateTokenResult.TopError.Description);

            return generateTokenResult.Errors;
        }

        return generateTokenResult.Value;
    }
}