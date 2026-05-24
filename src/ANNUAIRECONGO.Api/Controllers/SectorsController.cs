using ANNUAIRECONGO.Application.Features.Sectors.Commands;
using ANNUAIRECONGO.Application.Features.Sectors.Commands.ActivateSector;
using ANNUAIRECONGO.Application.Features.Sectors.Commands.DeactivateSector;
using ANNUAIRECONGO.Application.Features.Sectors.Commands.DeleteSector;
using ANNUAIRECONGO.Application.Features.Sectors.Commands.GenerateSectorReport;
using ANNUAIRECONGO.Application.Features.Sectors.Dtos;
using ANNUAIRECONGO.Application.Features.Sectors.Queries.GetSectorById;
using ANNUAIRECONGO.Application.Features.Sectors.Queries.GetSectorReports;
using ANNUAIRECONGO.Application.Features.Sectors.Queries.GetSectors;
using ANNUAIRECONGO.Contracts.Requests.Sectors;
using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;

namespace ANNUAIRECONGO.Api.Controllers;

[Route("api/v{version:apiVersion}/sectors")]
[ApiVersion("1.0")]
[Authorize]
public sealed class SectorsController(ISender sender) : ApiController
{
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Create a new sector.")]
    [EndpointDescription("This endpoint creates a new sector.")]
    [EndpointName("CreateSector")]
    [MapToApiVersion("1.0")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateSector([FromBody] CreateSectorCommand command, CancellationToken ct)
    {
        var result = await sender.Send(command, ct);
        return result.Match(
            response => CreatedAtRoute(
                routeName: "GetSectorById",
                routeValues: new { Version = "1.0", id = response.SectorId },
                value: response),
            Problem);
    }

    [HttpGet("{SectorId:guid}", Name = "GetSectorById")]
    [ProducesResponseType(typeof(SectorDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Retrieves a Sector by ID.")]
    [EndpointDescription("Returns detailed information about the specified sector if found.")]
    [EndpointName("GetSectorById")]
    [MapToApiVersion("1.0")]
    [OutputCache(Duration = 60)]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(Guid SectorId, CancellationToken ct)
    {
        var result = await sender.Send(new GetSectorByIdQuery(SectorId), ct);
        return result.Match(
            response => Ok(response),
            Problem);
    }

    [HttpGet(Name = "GetAllSectors")]
    [ProducesResponseType(typeof(List<SectorDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Retrieves all sectors.")]
    [EndpointDescription("Returns a list of all sectors.")]
    [EndpointName("GetAllSectors")]
    [MapToApiVersion("1.0")]
    [OutputCache(Duration = 60)]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var result = await sender.Send(new GetSectorsQuery(), ct);
        return result.Match(
            response => Ok(response),
            Problem);
    }

    [HttpPut("{SectorId:guid}", Name = "UpdateSector")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Updates a sector by ID.")]
    [EndpointDescription("Updates the specified sector.")]
    [EndpointName("UpdateSector")]
    [MapToApiVersion("1.0")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateSector(Guid SectorId, [FromBody] UpdateSectorRequest request, CancellationToken ct)
    {
        var result = await sender.Send(
            new UpdateSectorCommand(SectorId, request.Name, request.IConUrl, request.Description),
            ct);
        return result.Match(
            response => Ok(response),
            Problem);
    }

    [HttpDelete("{SectorId:guid}", Name = "DeleteSector")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Deletes a sector by ID.")]
    [EndpointDescription("Removes the specified sector from the system.")]
    [EndpointName("DeleteSector")]
    [MapToApiVersion("1.0")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteSector(Guid SectorId, CancellationToken ct)
    {
        var result = await sender.Send(new DeleteSectorCommand(SectorId), ct);
        return result.Match(
            _ => NoContent(),
            Problem);
    }

    [HttpPut("Deactivate/{SectorId:guid}", Name = "DeactivateSector")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Deactivates a sector by ID.")]
    [EndpointDescription("Deactivates the specified sector.")]
    [EndpointName("DeactivateSector")]
    [MapToApiVersion("1.0")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeactivateSector(Guid SectorId, CancellationToken ct)
    {
        var result = await sender.Send(new DeactivateSectorCommand(SectorId), ct);
        return result.Match(
            _ => Ok(),
            Problem);
    }

    [HttpPut("Activate/{SectorId:guid}", Name = "ActivateSector")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Activates a sector by ID.")]
    [EndpointDescription("Activates the specified sector.")]
    [EndpointName("ActivateSector")]
    [MapToApiVersion("1.0")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ActivateSector(Guid SectorId, CancellationToken ct)
    {
        var result = await sender.Send(new ActivateSectorCommand(SectorId), ct);
        return result.Match(
            _ => Ok(),
            Problem);
    }

    [HttpGet("intelligence-reports")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Retrieves economic sector intelligence reports.")]
    [EndpointDescription("Returns a list of generated AI sector reports.")]
    [EndpointName("GetSectorReports")]
    [MapToApiVersion("1.0")]
    [AllowAnonymous]
    public async Task<IActionResult> GetSectorReports(CancellationToken ct)
    {
        var result = await sender.Send(new GetSectorReportsQuery(), ct);
        return result.Match(
            response => Ok(response),
            Problem);
    }

    [HttpPost("intelligence-reports/generate")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Generates an economic intelligence report for a sector using AI.")]
    [EndpointDescription("Aggregates real company registration data and invokes Groq AI to generate insights.")]
    [EndpointName("GenerateSectorReport")]
    [MapToApiVersion("1.0")]
    [AllowAnonymous]
    public async Task<IActionResult> GenerateSectorReport([FromBody] GenerateSectorReportCommand command, CancellationToken ct)
    {
        var result = await sender.Send(command, ct);
        return result.Match(
            response => Ok(response),
            Problem);
    }
}
