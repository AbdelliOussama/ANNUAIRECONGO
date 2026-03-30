using ANNUAIRECONGO.Application.Features.BusinessOwners.Commands.UpdateBusinessOwnerProfile;
using ANNUAIRECONGO.Application.Features.BusinessOwners.Dtos;
using ANNUAIRECONGO.Application.Features.BusinessOwners.Queries.GetBusinessOwnerById;
using ANNUAIRECONGO.Application.Features.BusinessOwners.Queries.GetBusinessOwners;
using ANNUAIRECONGO.Application.Features.BusinessOwners.Queries.GetMyCompanies;
using ANNUAIRECONGO.Application.Features.Companies.Dtos;
using ANNUAIRECONGO.Contracts.Requests.BusinessOwner;
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


    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(BusinessOwnerDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Get a business owner by id.")]
    [EndpointDescription("This endpoint returns a business owner by its id.")]
    [EndpointName("GetBusinessOwnerById")]
    [MapToApiVersion("1.0")]
    [OutputCache(Duration = 60)]
    public async Task<IActionResult> GetBusinessOwnerById(Guid id, CancellationToken ct)
    {
        var result = await _sender.Send(new GetBusinessOwnerByIdQuery(id), ct);
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


    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(BusinessOwnerDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Update a business owner profile.")]
    [EndpointDescription("This endpoint updates a business owner's profile.")]
    [EndpointName("UpdateBusinessOwner")]
    [MapToApiVersion("1.0")]
    public async Task<IActionResult>UpdateBusinessOwner(Guid id, UpdateBusinessOwnerRequest request, CancellationToken ct)
    {
        var result = await _sender.Send(new UpdateBusinessOwnerProfileCommand(id,request.FirstName,request.LastName,request.PhoneNumber,request.CompanyPosition ), ct);
        return result.Match(
            response => Ok(response),
            Problem);
    }
}

