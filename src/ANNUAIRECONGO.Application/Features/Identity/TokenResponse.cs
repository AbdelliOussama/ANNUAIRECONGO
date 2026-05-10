namespace ANNUAIRECONGO.Application.Features.Identity;

public class TokenResponse
{
    public string? AccessToken { get; set; }
    public string? RefreshToken { get; set; }
    public DateTimeOffset ExpiresOnUtc { get; set; }
}
