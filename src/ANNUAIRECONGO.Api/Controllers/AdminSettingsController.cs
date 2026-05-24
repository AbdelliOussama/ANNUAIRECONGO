using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ANNUAIRECONGO.Api.Controllers;

[Route("api/v{version:apiVersion}/admin/settings")]
[ApiVersion("1.0")]
[Authorize(Roles = "Admin")]
public class AdminSettingsController : ApiController
{
    private static readonly Dictionary<string, object> _settings = new()
    {
        { "siteName", "Annuaire Congo" },
        { "contactEmail", "contact@annuairecongo.cg" },
        { "supportPhone", "+242 06 000 0000" },
        { "manualValidation", true },
        { "publicRegistration", true },
    };

    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [EndpointSummary("Get admin settings.")]
    [EndpointDescription("This endpoint gets admin settings.")]
    [EndpointName("GetSettings")]
    public IActionResult GetSettings()
    {
        return Ok(_settings);
    }

    [HttpPut]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [EndpointSummary("Update admin settings.")]
    [EndpointDescription("This endpoint updates admin settings.")]
    [EndpointName("UpdateSettings")]
    public IActionResult UpdateSettings([FromBody] Dictionary<string, object> settings)
    {
        foreach (var kvp in settings)
        {
            _settings[kvp.Key] = kvp.Value;
        }

        return Ok(_settings);
    }
}
