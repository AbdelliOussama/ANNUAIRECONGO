namespace ANNUAIRECONGO.Contracts.Requests.Identity;

public record RefreshTokenRequest(string RefreshToken, string ExpiredAccessToken);
