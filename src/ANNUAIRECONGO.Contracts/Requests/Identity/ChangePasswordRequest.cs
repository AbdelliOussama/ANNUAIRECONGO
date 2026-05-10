namespace ANNUAIRECONGO.Contracts.Requests.Identity;

public class ChangePasswordRequest
{
    public string CurrentPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}
