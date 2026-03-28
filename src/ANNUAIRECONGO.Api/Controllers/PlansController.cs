using ANNUAIRECONGO.Application.Features.Plans.Commands.ActivatePlan;
using ANNUAIRECONGO.Application.Features.Plans.Commands.DeActivatePlan;
using ANNUAIRECONGO.Application.Features.Plans.Commands.UpdatePlan;
using ANNUAIRECONGO.Application.Features.Plans.Queries.GetPlanById;
using ANNUAIRECONGO.Application.Features.Plans.Queries.GetPlans;
using ANNUAIRECONGO.Contracts.Requests.Plans;
using ANNUAIRECONGO.Domain.Subscriptions.Plans.Enums;
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

    [HttpPost("{id:guid}/activate")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Activate a plan.")]
    [EndpointDescription("This endpoint activates a specific plan.")]
    [EndpointName("ActivatePlan")]
    [MapToApiVersion("1.0")]
    public async Task<IActionResult>ActivatePlan([FromRoute] Guid id, CancellationToken ct)
    {
        var result = await sender.Send(new ActivatePlanCommand(id), ct);
        return result.Match(
            response => Ok(response),
            Problem);
    }

    [HttpPost("{id:guid}/deactivate")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Deactivate a plan.")]
    [EndpointDescription("This endpoint deactivates a specific plan.")]
    [EndpointName("DeActivatePlan")]
    [MapToApiVersion("1.0")]
    public async Task<IActionResult>DeActivatePlan([FromRoute] Guid id, CancellationToken ct)
    {
        var result = await sender.Send(new DeActivatePlanCommand(id), ct);
        return result.Match(
            response => Ok(response),
            Problem);
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Update a plan.")]
    [EndpointDescription("This endpoint updates a specific plan.")]
    [EndpointName("UpdatePlan")]
    [MapToApiVersion("1.0")]
    public async Task<IActionResult>UpdatePlan([FromRoute] Guid id, [FromBody] UpdatePlanRequest updatePlanRequest, CancellationToken ct)
    {
        var result = await sender.Send(new UpdatePlanCommand(id,(PlanName) updatePlanRequest.Name, updatePlanRequest.Price, updatePlanRequest.DurationDays, updatePlanRequest.MaxImages, updatePlanRequest.MaxDocuments, updatePlanRequest.HasAnalytics, updatePlanRequest.HasFeaturedBadge, updatePlanRequest.SearchPriority), ct);
        return result.Match(
            response => Ok(response),
            Problem);
    }
}
