using ANNUAIRECONGO.Application.Features.BusinessOwners.Dtos;
using ANNUAIRECONGO.Application.Features.BusinessOwners.Queries.GetBusinessOwners;
using ANNUAIRECONGO.Application.Features.BusinessOwners.Queries.GetMyCompanies;
using ANNUAIRECONGO.Application.Features.Companies.Dtos;
using ANNUAIRECONGO.Domain.Common.Results;
using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;

namespace ANNUAIRECONGO.Api.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/business-owners")]
[Authorize]
public sealed class BusinessOwnersControllers : ApiController
{
    private readonly ISender _sender;
    public BusinessOwnersControllers(ISender sender)
    {
        _sender = sender;
    }
    [HttpGet]
    [ProducesResponseType(typeof(BusinessOwnerDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Get all business owners.")]
    [EndpointDescription("This endpoint returns a list of all business owners.")]
    [EndpointName("GetBusinessOwners")]
    [MapToApiVersion("1.0")]
    [OutputCache(Duration =60)]
    public async Task<IActionResult> GetBusinessOwners(CancellationToken ct)
    {
        var result = await _sender.Send(new GetBusinessOwnersQuery(), ct);
        return result.Match(
            response => Ok(response),
            Problem);
    }


    [HttpGet("my-companies")]
    [ProducesResponseType(typeof(List<CompanyDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Get my companies.")]
    [EndpointDescription("This endpoint returns a list of companies owned by the authenticated business owner.")]
    [EndpointName("GetMyCompanies")]
    [MapToApiVersion("1.0")]
    [OutputCache(Duration = 60)]
    public async Task<IActionResult> GetMyCompanies(CancellationToken ct)
    {
        var result = await _sender.Send(new GetMyCompaniesQuery(), ct);
        return result.Match(
            response => Ok(response),
            Problem);
    }
}