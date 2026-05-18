using ANNUAIRECONGO.Application.Common.Behaviors;
using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Domain.Common.Results;
using Microsoft.Extensions.Caching.Hybrid;
using Microsoft.Extensions.Logging;
using NSubstitute;
using Xunit;

namespace AnnuaireCongo.Application.UnitTests.Behaviours;
public class CachingBehaviorTests
{
    private readonly HybridCache _cache = Substitute.For<HybridCache>();
    private readonly ILogger<CachingBehavior<CachedQuery, Result<string>>> _logger = Substitute.For<ILogger<CachingBehavior<CachedQuery, Result<string>>>>();

    private readonly CachingBehavior<CachedQuery, Result<string>> _sut;

    public CachingBehaviorTests()
    {
        _sut = new CachingBehavior<CachedQuery, Result<string>>(_cache, _logger);
    }

    [Fact]
    public async Task Handle_WhenNotCachedQuery_ShouldSkipCacheAndReturnResult()
    {
        // Arrange
        var uncachedRequest = new NonCachedQuery();
        var behavior = new CachingBehavior<NonCachedQuery, string>(_cache, Substitute.For<ILogger<CachingBehavior<NonCachedQuery, string>>>());

        // Act
        var result = await behavior.Handle(uncachedRequest, _ => Task.FromResult("OK"), CancellationToken.None);

        // Assert
        Assert.Equal("OK", result);
        await _cache.DidNotReceive().SetAsync(
            Arg.Any<string>(),
            Arg.Any<string>(),
            Arg.Any<HybridCacheEntryOptions>(),
            Arg.Any<string[]>(),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WhenCachedQueryAndResultIsSuccess_ShouldCacheResult()
    {
        // Arrange
        var request = new CachedQuery();
        var response = (Result<string>)"test-value";

        string? actualKey = null;
        object? actualValue = null;
        HybridCacheEntryOptions? actualOptions = null;
        string[]? actualTags = null;
        CancellationToken actualToken = default;

        _cache.GetOrCreateAsync(
            Arg.Do<string>(k => actualKey = k),
            Arg.Any<Func<CancellationToken, ValueTask<Result<string>>>>(),
            Arg.Do<HybridCacheEntryOptions>(o => actualOptions = o),
            Arg.Do<IEnumerable<string>>(t => actualTags = t?.ToArray()),
            Arg.Do<CancellationToken>(c => actualToken = c))
            .Returns(callInfo =>
            {
                var factory = callInfo.Arg<Func<CancellationToken, ValueTask<Result<string>>>>();
                return factory(callInfo.Arg<CancellationToken>());
            });

        // Act
        var result = await _sut.Handle(request, _ => Task.FromResult(response), CancellationToken.None);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.Equal(request.CacheKey, actualKey);

        Assert.Equal("test-value", result.Value);

        Assert.Equal(request.Expiration, actualOptions!.Expiration);
        Assert.Equal(request.Tags, actualTags);
    }

    [Fact]
    public async Task Handle_WhenCachedQueryAndResultIsError_ShouldNotCacheResult()
    {
        // Arrange
        var request = new CachedQuery();
        var errorResult = (Result<string>)Error.Validation("code", "message");

        _cache.GetOrCreateAsync(
            Arg.Any<string>(),
            Arg.Any<Func<CancellationToken, ValueTask<Result<string>>>>(),
            Arg.Any<HybridCacheEntryOptions>(),
            Arg.Any<IEnumerable<string>>(),
            Arg.Any<CancellationToken>())
            .Returns(callInfo =>
            {
                var factory = callInfo.Arg<Func<CancellationToken, ValueTask<Result<string>>>>();
                return factory(callInfo.Arg<CancellationToken>());
            });

        // Act
        var result = await _sut.Handle(request, _ => Task.FromResult(errorResult), CancellationToken.None);

        // Assert
        Assert.True(result.IsError);

        var calls = _cache.ReceivedCalls();
        Assert.Empty(calls.Where(c => c.GetMethodInfo().Name == "SetAsync"));
    }

    public class NonCachedQuery;

    public class CachedQuery : ICachedQuery
    {
        public string CacheKey => "test-key";
        public TimeSpan Expiration => TimeSpan.FromMinutes(5);
        public string[] Tags => ["unit-test"];
    }
}