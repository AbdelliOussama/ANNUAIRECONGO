using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Features.Identity.Dtos;
using ANNUAIRECONGO.Application.Features.Identity.Queries.GetUsers;
using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ANNUAIRECONGO.Api.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/admin")]
[Authorize(Roles = "Admin")]
public sealed class AdminController(ISender sender) : ApiController
{
    [HttpGet("users")]
    [ProducesResponseType(typeof(List<AppUserDto>), StatusCodes.Status200OK)]
    [EndpointSummary("Get all users.")]
    [EndpointDescription("This endpoint returns a list of all users registered on the platform.")]
    [EndpointName("GetUsers")]
    [MapToApiVersion("1.0")]
    public async Task<IActionResult> GetUsers(CancellationToken ct)
    {
        var result = await sender.Send(new GetUsersQuery(), ct);
        return result.Match(
            response => Ok(response),
            Problem);
    }

    [HttpDelete("users/{userId}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [EndpointSummary("Delete a user.")]
    [EndpointDescription("Permanently deletes a user account and their profile.")]
    [EndpointName("DeleteUser")]
    [MapToApiVersion("1.0")]
    public async Task<IActionResult> DeleteUser(string userId, [FromServices] IIdentityService identityService, CancellationToken ct)
    {
        var result = await identityService.DeleteAccountAsync(userId, ct);
        return result.Match(
            _ => NoContent(),
            Problem);
    }
}
