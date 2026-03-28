using ANNUAIRECONGO.Application.Features.Geography.Commands.CreateCity;
using ANNUAIRECONGO.Application.Features.Geography.Commands.CreateRegion;
using ANNUAIRECONGO.Application.Features.Geography.Dtos;
using ANNUAIRECONGO.Application.Features.Geography.Queries.GetCitiesByRegion;
using ANNUAIRECONGO.Application.Features.Geography.Queries.GetRegions;
using ANNUAIRECONGO.Contracts.Requests.Geography;
using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ANNUAIRECONGO.Api.Controllers;

[Route("api/v{version:apiVersion}/geography")]
[ApiVersion("1.0")]
public sealed class GeographyController(ISender sender) : ApiController
{
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Get all regions.")]
    [EndpointDescription("This endpoint gets all regions.")]
    [EndpointName("GetRegions")]
    [MapToApiVersion("1.0")]
    public async Task<IActionResult> GetRegions(CancellationToken ct)
    {
        var result = await sender.Send(new GetRegionsQuery(), ct);
        return result.Match(
            response => Ok(response),
            Problem);
    }

    [HttpGet("{regionId:guid}/cities")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Get cities by region id.")]
    [EndpointDescription("This endpoint gets all cities for a specific region.")]
    [EndpointName("GetCitiesByRegion")]
    [MapToApiVersion("1.0")]
    public async Task<IActionResult> GetCitiesByRegion([FromRoute] Guid regionId, CancellationToken ct)
    {
        var result = await sender.Send(new GetCitiesByRegionQuery(regionId), ct);
        return result.Match(
            response => Ok(response),
            Problem);
    }

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Create a new region.")]
    [EndpointDescription("This endpoint creates a new region.")]
    [EndpointName("CreateRegion")]
    [MapToApiVersion("1.0")]
    public async Task<IActionResult> CreateRegion([FromBody] CreateRegionRequest request, CancellationToken ct)
    {
        var command = new CreateRegionCommand(request.Name);
        var result = await sender.Send(command, ct);
        return result.Match(
            region => Created($"/api/v1.0/geography/regions/{region.Id}", region),
            Problem);
    }

    [HttpPost("cities")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Create a new city.")]
    [EndpointDescription("This endpoint creates a new city in a specific region.")]
    [EndpointName("CreateCity")]
    [MapToApiVersion("1.0")]
    public async Task<IActionResult> CreateCity([FromBody] CreateCityRequest request, CancellationToken ct)
    {
        var command = new CreateCityCommand(request.Name, request.RegionId);
        var result = await sender.Send(command, ct);
        return result.Match(
            city => Created($"/api/v1.0/geography/regions/{request.RegionId}/cities/{city.Id}", city),
            Problem);
    }
}