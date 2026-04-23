
namespace ANNUAIRECONGO.Application.Features.Companies.Dtos;

public class CompanyFollowDto
{
    public Guid CompanyId { get; set; }
    public string UserId { get; set; } = string.Empty;
    public DateTimeOffset FollowedAt { get; set; }
    public DateTimeOffset? LastCheckedAt { get; set; }
    public bool IsEmailEnabled { get; set; }
}
