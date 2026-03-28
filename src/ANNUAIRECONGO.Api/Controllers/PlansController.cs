using ANNUAIRECONGO.Application.Features.Plans.Dtos;
using ANNUAIRECONGO.Application.Features.Plans.Queries.GetPlanById;
using ANNUAIRECONGO.Application.Features.Plans.Queries.GetPlans;
using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ANNUAIRECONGO.Api.Controllers;

[Route("api/v{version:apiVersion}/plans")]
[ApiVersion("1.0")]
public sealed class PlansController(ISender sender) : ApiController
{
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Get all plans.")]
    [EndpointDescription("This endpoint gets all available plans.")]
    [EndpointName("GetPlans")]
    [MapToApiVersion("1.0")]
    public async Task<IActionResult> GetPlans(CancellationToken ct)
    {
        var result = await sender.Send(new GetPlansQuery(), ct);
        return result.Match(
            response => Ok(response),
            Problem);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Get a plan by id.")]
    [EndpointDescription("This endpoint gets a specific plan by its id.")]
    [EndpointName("GetPlanById")]
    [MapToApiVersion("1.0")]
    public async Task<IActionResult> GetPlanById([FromRoute] Guid id, CancellationToken ct)
    {
        var result = await sender.Send(new GetPlanByIdQuery(id), ct);
        return result.Match(
            response => Ok(response),
            Problem);
    }
}