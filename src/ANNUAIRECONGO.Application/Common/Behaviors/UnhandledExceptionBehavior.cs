using MediatR;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Common.Behaviors;

public class UnhandledExceptionBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse> where TRequest : notnull
{
    #region Fields
    private readonly ILogger<TRequest> _logger;
    #endregion

    #region Constructor
    public UnhandledExceptionBehavior(ILogger<TRequest> logger)
    {
        _logger = logger;
    }
    #endregion
    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
    {
        try
        {
            return await next(cancellationToken);
        }
        catch (OperationCanceledException)
        {
            // Client cancelled the request (e.g. search-as-you-type) — not a server error
            var requestName = typeof(TRequest).Name;
            _logger.LogDebug("Request {Name} was cancelled by the client", requestName);
            throw;
        }
        catch(Exception ex)
        {
            var requestName = typeof(TRequest).Name;
            _logger.LogError(ex, "Request: Unhandled Exception for Request {Name} {@Request}", requestName, request);

            throw;
        }
    }
}
