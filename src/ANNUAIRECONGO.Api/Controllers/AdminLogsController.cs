using ANNUAIRECONGO.Application.Features.AdminLogs.Queries.GetAdminLogsQuery;
using ANNUAIRECONGO.Application.Features.AdminLogs.Queries.GetEntityAdminLogsQuery;
using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ANNUAIRECONGO.Api.Controllers;

[Route("api/v{version:apiVersion}/admin/logs")]
[ApiVersion("1.0")]
[Authorize(Roles = "Admin")]
public sealed class AdminLogsController(ISender sender) : ApiController
{
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [EndpointSummary("Get admin logs.")]
    [EndpointDescription("This endpoint gets admin logs.")]
    [EndpointName("GetAdminLogs")]
    [MapToApiVersion("1.0")]
    public async Task<IActionResult> GetAdminLogs(
        [FromQuery] string? searchTerm,
        [FromQuery] string? action,
        [FromQuery] string? targetType,
        [FromQuery] string? adminId,
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var query = new GetAdminLogsQuery(
            SearchTerm: searchTerm,
            Action: action,
            TargetType: targetType,
            AdminId: adminId,
            StartDate: startDate,
            EndDate: endDate,
            PageNumber: pageNumber,
            PageSize: pageSize);

        var result = await sender.Send(query, cancellationToken);

        return result.IsSuccess ? Ok(result.Value) : Problem(result.Errors);
    }

    [HttpGet("{targetType}/{targetId:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [EndpointSummary("Get admin logs for a specific entity.")]
    [EndpointDescription("This endpoint gets admin logs for a specific entity.")]
    [EndpointName("GetEntityAdminLogs")]
    [MapToApiVersion("1.0")]
    public async Task<IActionResult> GetEntityAdminLogs(
        [FromRoute] string targetType,
        [FromRoute] Guid targetId,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var query = new GetEntityAdminLogsQuery(
            TargetType: targetType,
            TargetId: targetId,
            PageNumber: pageNumber,
            PageSize: pageSize);

        var result = await sender.Send(query, cancellationToken);

        return result.IsSuccess ? Ok(result.Value) : Problem(result.Errors);
    }
}