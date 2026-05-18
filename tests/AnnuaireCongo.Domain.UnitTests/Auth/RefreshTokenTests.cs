using System.Runtime.InteropServices;
using AnnuaireCongo.Tests.Common.Auth;
using Xunit;

namespace AnnuaireCongo.Domain.UnitTests.Auth;
public class RefreshTokenTests
{
    [Fact]
    public void CreateRefreshToken_ShouldSucced_WithValidData()
    {
        var id = Guid.NewGuid();
        var UserId = Guid.NewGuid().ToString();
        const string tokenValue = "sample_refresh_token";
        var expiresOnUtc = DateTimeOffset.UtcNow.AddDays(7);

        var result = RefreshTokenFactory.CreateRefreshToken(id: id, token: tokenValue, userId: UserId, expiresOnUtc: expiresOnUtc);

        Assert.True(result.IsSuccess);
        var token = result.Value;
        Assert.Equal(id, token.Id);
        Assert.Equal(UserId, token.UserId);
        Assert.Equal(tokenValue, token.Token);
        Assert.Equal(expiresOnUtc, token.ExpiresOnUtc);
        Assert.True(token.ExpiresOnUtc>DateTimeOffset.UtcNow);
        Assert.False(string.IsNullOrEmpty(token.UserId));
    }

    [Fact]
    public void CreateRefreshToken_ShouldFail_WithEmptyId()
    {
        var result = RefreshTokenFactory.CreateRefreshToken(id: Guid.Empty);
        Assert.True(result.IsError);
        Assert.Equal("RefreshToken_Id_Required", result.Errors.First().Code);
    }

    [Theory]
    [InlineData("")]
    [InlineData(" ")]
    public void CreateRefreshToken_ShouldFail_WhenTokenIsInvalid  (string? InvalidToken)
    {
        var result = RefreshTokenFactory.CreateRefreshToken(token: InvalidToken);
        Assert.True(result.IsError);
        Assert.Equal("RefreshToken_Token_Required", result.Errors.First().Code);
    }

    [Theory]
    [InlineData("")]
    [InlineData(" ")]
    public void CreateRefreshToken_ShouldFail_WhenUserIdIsInvalid  (string? InvalidUserId)
    {
        var result = RefreshTokenFactory.CreateRefreshToken(userId: InvalidUserId);
        Assert.True(result.IsError);
        Assert.Equal("RefreshToken_UserId_Required", result.Errors.First().Code);
    }
    [Fact]
    public void CreateRefreshToken_ShouldFail_WhenExpiresOnUtcIsInThePast()
    {
        var pastDate = DateTimeOffset.UtcNow.AddDays(-1);
        var result = RefreshTokenFactory.CreateRefreshToken(expiresOnUtc: pastDate);
        Assert.True(result.IsError);
        Assert.Equal("RefreshToken_Expiry_Invalid", result.Errors.First().Code);
    }
}