using ANNUAIRECONGO.Application.Features.Stats.Dtos;
using ANNUAIRECONGO.Application.Features.Stats.Queries.GetCompanyStats;
using ANNUAIRECONGO.Application.Features.Stats.Queries.GetPlatformSummary;
using ANNUAIRECONGO.Application.Features.Stats.Queries.GetRegionStats;
using ANNUAIRECONGO.Application.Features.Stats.Queries.GetSectorStats;
using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ANNUAIRECONGO.Api.Controllers;

[Route("api/v{version:apiVersion}/stats")]
[ApiVersion("1.0")]
public sealed class StatsController(ISender sender) : ApiController
{
    [HttpGet("platform-summary")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Get platform summary statistics.")]
    [EndpointDescription("This endpoint gets overall platform statistics.")]
    [EndpointName("GetPlatformSummary")]
    [MapToApiVersion("1.0")]
    public async Task<IActionResult> GetPlatformSummary(CancellationToken ct)
    {
        var result = await sender.Send(new GetPlatformSummaryQuery(), ct);
        return result.Match(
            response => Ok(response),
            Problem);
    }

    [HttpGet("regions")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Get region statistics.")]
    [EndpointDescription("This endpoint gets statistics for each region.")]
    [EndpointName("GetRegionStats")]
    [MapToApiVersion("1.0")]
    public async Task<IActionResult> GetRegionStats(CancellationToken ct)
    {
        var result = await sender.Send(new GetRegionStatsQuery(), ct);
        return result.Match(
            response => Ok(response),
            Problem);
    }

    [HttpGet("sectors")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Get sector statistics.")]
    [EndpointDescription("This endpoint gets statistics for each sector.")]
    [EndpointName("GetSectorStats")]
    [MapToApiVersion("1.0")]
    public async Task<IActionResult> GetSectorStats(CancellationToken ct)
    {
        var result = await sender.Send(new GetSectorStatsQuery(), ct);
        return result.Match(
            response => Ok(response),
            Problem);
    }

    /// <summary>
    /// Audit fix #3 — per-company analytics for the espace/statistiques page.
    /// Owner-scoped: only the company's owner may read its stats.
    /// </summary>
    [HttpGet("companies/{companyId:guid}")]
    [Authorize]
    [ProducesResponseType(typeof(CompanyStatsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [EndpointSummary("Get analytics for one company.")]
    [EndpointDescription("Owner-scoped — returns views, unique visitors, contact clicks, search appearances and a 6-month bar chart of profile views.")]
    [EndpointName("GetCompanyStats")]
    [MapToApiVersion("1.0")]
    public async Task<IActionResult> GetCompanyStats([FromRoute] Guid companyId, CancellationToken ct)
    {
        var result = await sender.Send(new GetCompanyStatsQuery(companyId), ct);
        return result.Match(
            response => Ok(response),
            Problem);
    }
}