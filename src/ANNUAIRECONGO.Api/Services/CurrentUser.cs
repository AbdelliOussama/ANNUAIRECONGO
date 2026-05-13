using System.Security.Claims;
using ANNUAIRECONGO.Application.Common.Interfaces;

namespace ANNUAIRECONGO.Api.Services;

public class CurrentUser : IUser
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    private readonly ILogger<CurrentUser> _logger;

    public CurrentUser(IHttpContextAccessor httpContextAccessor, ILogger<CurrentUser> logger)
    {
        _httpContextAccessor = httpContextAccessor;
        _logger = logger;
    }

    public string? Id 
    {
        get 
        {
            var user = _httpContextAccessor.HttpContext?.User;
            if (user == null) return null;

            var id = user.FindFirstValue(ClaimTypes.NameIdentifier) 
                     ?? user.FindFirstValue("sub");
            
            if (string.IsNullOrEmpty(id))
            {
                var claims = string.Join(", ", user.Claims.Select(c => $"{c.Type}: {c.Value}"));
                _logger.LogWarning("CurrentUser: User ID is null. IsAuthenticated: {IsAuthenticated}, Claims: {Claims}", 
                    user.Identity?.IsAuthenticated ?? false,
                    claims);
            }
            
            return id;
        }
    }
}
