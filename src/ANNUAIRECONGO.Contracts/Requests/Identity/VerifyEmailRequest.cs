namespace ANNUAIRECONGO.Contracts.Requests.Identity;

public class VerifyEmailRequest
{
    public string Email { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;
}
