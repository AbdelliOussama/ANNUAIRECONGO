using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Features.Identity.Commands.CreateCompanyForOwner;
using ANNUAIRECONGO.Application.Features.Identity.Dtos;
using ANNUAIRECONGO.Application.Features.Identity.Queries.GetUsers;
using ANNUAIRECONGO.Contracts.Requests.Identity;
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

    [HttpPost("companies/on-behalf")]
    [ProducesResponseType(typeof(Guid), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Admin creates a company on behalf of a passive business owner.")]
    [EndpointDescription(
        "Creates a BusinessOwner contact record (no Identity user, no password) and a Company " +
        "in a single atomic transaction. The company starts at Draft status and is auto-subscribed " +
        "to the Free plan. The admin manages the company entirely — the owner has no system account.")]
    [EndpointName("CreateCompanyForOwner")]
    [MapToApiVersion("1.0")]
    public async Task<IActionResult> CreateCompanyForOwner(
        [FromBody] CreateCompanyForOwnerRequest request,
        CancellationToken ct)
    {
        var result = await sender.Send(new CreateCompanyForOwnerCommand(
            request.OwnerFirstName,
            request.OwnerLastName,
            request.OwnerPhone,
            request.OwnerEmail,
            request.OwnerPosition,
            request.CompanyName,
            request.CityId,
            request.SectorIds,
            request.Website,
            request.Rccm,
            request.Niu), ct);

        return result.Match(
            companyId => Created($"/api/v1/admin/companies/{companyId}", companyId),
            Problem);
    }
}
