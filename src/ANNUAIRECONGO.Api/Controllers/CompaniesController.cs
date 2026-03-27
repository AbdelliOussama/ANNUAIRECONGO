using ANNUAIRECONGO.Application.Features.Companies.Commands.Contacts.AddContact;
using ANNUAIRECONGO.Application.Features.Companies.Commands.Contacts.RemoveContact;
using ANNUAIRECONGO.Application.Features.Companies.Commands.Contacts.UpdateContact;
using ANNUAIRECONGO.Application.Features.Companies.Commands.CreateCompany;
using ANNUAIRECONGO.Application.Features.Companies.Commands.PlanManagment.ClearActiveSubscription;
using ANNUAIRECONGO.Application.Features.Companies.Commands.PlanManagment.SetActiveSubscription;
using ANNUAIRECONGO.Application.Features.Companies.Commands.PlanManagment.SetFeatured;
using ANNUAIRECONGO.Application.Features.Companies.Commands.StatusTransition.ReactivateCompany;
using ANNUAIRECONGO.Application.Features.Companies.Commands.StatusTransition.RejectCompany;
using ANNUAIRECONGO.Application.Features.Companies.Commands.StatusTransition.SubmitCompany;
using ANNUAIRECONGO.Application.Features.Companies.Commands.StatusTransition.SuspendCompnay;
using ANNUAIRECONGO.Application.Features.Companies.Commands.StatusTransition.ValidateCompany;
using ANNUAIRECONGO.Application.Features.Companies.Queries.GetCompanies;
using ANNUAIRECONGO.Application.Features.Companies.Queries.GetCompanyById;
using ANNUAIRECONGO.Contracts.Common;
using ANNUAIRECONGO.Contracts.Requests.Companies.Contacts;
using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ANNUAIRECONGO.Api.Controllers;


[Route("api/v{version:apiVersion}/companies")]
[ApiVersion("1.0")]
public sealed class CompaniesController(ISender sender) : ApiController
{
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Create a new company.")]
    [EndpointDescription("This endpoint creates a new company.")]
    [EndpointName("CreateCompany")]
    [MapToApiVersion("1.0")]
    public async Task<IActionResult> CreateCompany([FromBody] CreateCompanyCommand command, CancellationToken ct)
    {
        var result = await sender.Send(command, ct);
        return result.Match(
            response => CreatedAtRoute(
                routeName : "GetCompanyById",
                routeValues : new { Version = "1.0", id = response.Id   },
                value : response
            ),
            Problem);
    }

    [HttpGet("{id:guid}" , Name = "GetCompanyById")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Get a company by id.")]
    [EndpointDescription("This endpoint gets a company by id.")]
    [EndpointName("GetCompanyById")]
    [MapToApiVersion("1.0")]
    public async Task<IActionResult> GetCompanyById([FromRoute] Guid id, CancellationToken ct)
    {
        var result = await sender.Send(new GetCompanyByIdQuery(id), ct);
        return result.Match(
            response => Ok(response),
            Problem
        );
    }

    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Get Paginaiton of all companies.")]
    [EndpointDescription("This endpoint gets all companies.")]
    [EndpointName("GetAllCompanies")]
    [MapToApiVersion("1.0")]
    public async Task<IActionResult> GetAllCompanies(CancellationToken ct)
    {
        var result = await sender.Send(new GetCompaniesQuery(), ct);
        return result.Match(
            response => Ok(response),
            Problem
        );
    }

    [HttpPut("{id:guid}/ReactivateCompany" , Name = "ReactivateCompany")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Reactivate a company by id.")]
    [EndpointDescription("This endpoint reactivate a company by id.")]
    [EndpointName("ReactivateCompany")]
    [MapToApiVersion("1.0")]
    public async Task<IActionResult>ReactivateCompany([FromRoute] Guid id, CancellationToken ct)
    {
        var result = await sender.Send(new ReactivateCompanyCommand(id), ct);
        return result.Match(
            response => Ok(response),
            Problem
        );
    }

    [HttpPut("{id:guid}/RejectCompany" , Name = "RejectCompany")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Reject a company by id.")]
    [EndpointDescription("This endpoint reject a company by id.")]
    [EndpointName("RejectCompany")]
    [MapToApiVersion("1.0")]
    public async Task<IActionResult>RejectCompany([FromRoute] Guid id,[FromBody] string reason,CancellationToken ct)
    {
        var result = await sender.Send(new RejectCompanyCommand(id,reason), ct);
        return result.Match(
            response => Ok(response),
            Problem
        );
    }

    [HttpPut("{id:guid}/SubmitCompany" , Name = "SubmitCompany")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Submit a company by id.")]
    [EndpointDescription("This endpoint submit a company by id.")]
    [EndpointName("SubmitCompany")]
    [MapToApiVersion("1.0")]
    public async Task<IActionResult>SubmitCompany([FromRoute] Guid id, CancellationToken ct)
    {
        var result = await sender.Send(new SubmitCompanyCommand(id), ct);
        return result.Match(
            response => Ok(response),
            Problem
        );
    }

    [HttpPut("{id:guid}/SuspendCompany" , Name = "SuspendCompany")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Suspend a company by id.")]
    [EndpointDescription("This endpoint suspend a company by id.")]
    public async Task<IActionResult>SuspendCompany([FromRoute] Guid id, CancellationToken ct)
    {
        var result = await sender.Send(new SuspendCompanyCommand(id), ct);
        return result.Match(
            response => Ok(response),
            Problem
        );
    }

    [HttpPut("{id:guid}/ValidateCompany" , Name = "ValidateCompany")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Validate a company by id.")]
    [EndpointDescription("This endpoint validate a company by id.")]
    [EndpointName("ValidateCompany")]
    [MapToApiVersion("1.0")]
    public async Task<IActionResult> ValidateCompany(Guid id, CancellationToken ct)
    {
        var result = await sender.Send(new ValidateCompanyCommand(id), ct);
        return result.Match(
            response => Ok(response),
            Problem
        );
    }

    // Plan Management

    [HttpPut("{id:guid}/ClearActiveSubscription" , Name = "ClearActiveSubscription")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Clear active subscription for a company by id.")]
    [EndpointDescription("This endpoint clear active subscription for a company by id.")]
    [EndpointName("ClearActiveSubscription")]
    [MapToApiVersion("1.0")]
    public async Task<IActionResult>ClearActiveSubscription(Guid id, CancellationToken ct)
    {
        var result = await sender.Send(new ClearActiveSubscriptionCommand(id), ct);
        return result.Match(
            response => Ok(response),
            Problem
        );
    }


    [HttpPut("{id:guid}/SetActiveSubscription" , Name = "SetActiveSubscription")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Set active subscription for a company by id.")]
    [EndpointDescription("This endpoint set active subscription for a company by id.")]
    [EndpointName("SetActiveSubscription")]
    [MapToApiVersion("1.0")]

    public async Task<IActionResult> SetActiveSubscription(Guid id, [FromBody] Guid subscriptionId, CancellationToken ct)
    {
        var result = await sender.Send(new SetActiveSubscriptionCommand(id,subscriptionId), ct);
        return result.Match(
            response => Ok(response),
            Problem
        );
    }


    [HttpPut("{id:guid}/setFeatured" , Name = "setFeatured")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Set featured for a company by id.")]
    [EndpointDescription("This endpoint set featured for a company by id.")]
    [EndpointName("setFeatured")]
    [MapToApiVersion("1.0")]
    public async Task<IActionResult> setFeatured(Guid id,[FromBody] bool isFeatured, CancellationToken ct)
    {
        var result = await sender.Send(new SetFeatureCommand(id,isFeatured), ct);
        return result.Match(
            response => Ok(response),
            Problem
        );
    }

    // ****************** Company Contacts ******************
    [HttpPost("{id:guid}/AddContact" , Name = "AddContact")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Add contact for a company by id.")]
    [EndpointDescription("This endpoint add contact for a company by id.")]
    [EndpointName("AddContact")]
    [MapToApiVersion("1.0")]
    public async Task<IActionResult> AddContact(Guid id, [FromBody] AddContactRequest commandRequest, CancellationToken ct)
    {
        var command = new AddContactCommand(id,(Domain.Companies.Enums.ContactType)commandRequest.Type,commandRequest.Value,commandRequest.IsPrimary);
        var result = await sender.Send(command, ct);
        return result.Match(
            response => Ok(response),
            Problem
        );
    }

    [HttpDelete("{id:guid}/RemoveContact" , Name = "RemoveContact")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Remove contact for a company by id.")]
    [EndpointDescription("This endpoint remove contact for a company by id.")]
    [EndpointName("RemoveContact")]
    [MapToApiVersion("1.0")]
    public async Task<IActionResult> RemoveContact(Guid id, [FromBody] Guid contactId, CancellationToken ct)
    {
        var command = new RemoveContactCommand(id, contactId);
        var result = await sender.Send(command, ct);
        return result.Match(
            response => Ok(response),
            Problem
        );
    }

    [HttpPut("{id:guid}/UpdateContact" , Name = "UpdateContact")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Update contact for a company by id.")]
    [EndpointDescription("This endpoint update contact for a company by id.")]
    [EndpointName("UpdateContact")]
    [MapToApiVersion("1.0")]
    public async Task<IActionResult> UpdateContact(Guid id, [FromBody] UpdateContactRequest commandRequest, CancellationToken ct)
    {
        var command = new UpdateContactCommand(id,commandRequest.ContactId,(Domain.Companies.Enums.ContactType)commandRequest.Type,commandRequest.Value,commandRequest.IsPrimary);
        var result = await sender.Send(command, ct);
        return result.Match(
            response => Ok(response),
            Problem
        );
    }
    // ****************** Company Contacts ******************


    
}