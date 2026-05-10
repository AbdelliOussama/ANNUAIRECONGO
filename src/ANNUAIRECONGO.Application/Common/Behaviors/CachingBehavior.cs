using MediatR;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Caching.Hybrid;
using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Domain.Common.Results;


namespace ANNUAIRECONGO.Application.Common.Behaviors;

public class CachingBehavior<TRequest, TResponse>(
    HybridCache cache,
    ILogger<CachingBehavior<TRequest, TResponse>> logger)
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly HybridCache _cache = cache;
    private readonly ILogger<CachingBehavior<TRequest, TResponse>> _logger = logger;

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken ct)
    {
        if (request is not ICachedQuery cachedRequest)
        {
            return await next(ct);
        }

        _logger.LogInformation("Checking cache for {RequestName}", typeof(TRequest).Name);

        return await _cache.GetOrCreateAsync(
            cachedRequest.CacheKey,
            async token =>
            {
                _logger.LogInformation("Cache miss for {RequestName}. Fetching from database.", typeof(TRequest).Name);
                
                var response = await next(token);

                if (response is IResult res && !res.IsSuccess)
                {
                    return response;
                }

                return response;
            },
            new HybridCacheEntryOptions
            {
                Expiration = cachedRequest.Expiration
            },
            cachedRequest.Tags,
            cancellationToken: ct);
    }
}
