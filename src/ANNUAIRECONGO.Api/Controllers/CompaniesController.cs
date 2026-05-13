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
using ANNUAIRECONGO.Application.Features.Companies.Commands.StatusTransition.SuspendCompany;
using ANNUAIRECONGO.Application.Features.Companies.Commands.StatusTransition.ValidateCompany;
using ANNUAIRECONGO.Application.Features.Companies.Queries.GetCompanies;
using ANNUAIRECONGO.Application.Features.Companies.Queries.GetCompanyById;
using ANNUAIRECONGO.Contracts.Requests.Companies.Contacts;
using ANNUAIRECONGO.Domain.Companies.Enums;
using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using ANNUAIRECONGO.Contracts.Requests.Companies;
using ANNUAIRECONGO.Application.Features.Companies.Commands.UpdateComanyProfile;
using ANNUAIRECONGO.Application.Features.Companies.Commands.UpdateMedia;
using Microsoft.AspNetCore.Authorization;
using ANNUAIRECONGO.Application.Features.Companies.Commands.Images.AddImage;
using ANNUAIRECONGO.Contracts.Requests.Companies.Images;
using ANNUAIRECONGO.Application.Features.Companies.Commands.Images.RemoveImage;
using ANNUAIRECONGO.Application.Features.Companies.Commands.Documents.AddDocument;
using ANNUAIRECONGO.Application.Features.Companies.Commands.Documents.RemoveDocument;
using ANNUAIRECONGO.Application.Features.Companies.Commands.Services.AddService;
using ANNUAIRECONGO.Application.Features.Companies.Commands.Services.RemoveService;
using ANNUAIRECONGO.Application.Features.Companies.Commands.Reports.AddReport;
using ANNUAIRECONGO.Application.Features.Companies.Commands.ContactClick.TrackContactClick;
using ANNUAIRECONGO.Contracts.Requests.Companies.ContactClick;
using ANNUAIRECONGO.Contracts.Requests.Companies.Documents;
using ANNUAIRECONGO.Contracts.Requests.Companies.Services;
using ANNUAIRECONGO.Contracts.Requests.Companies.Reports;
using ANNUAIRECONGO.Contracts.Requests.Companies.StatusTransitions;
using ANNUAIRECONGO.Application.Features.Companies.Queries.GetCompanyBySlugQuery;

namespace ANNUAIRECONGO.Api.Controllers;


[Route("api/v{version:apiVersion}/companies")]
[ApiVersion("1.0")]
[Authorize]
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
    [Authorize(Roles = "Admin,EntrepriseOwner")]
    public async Task<IActionResult> CreateCompany([FromBody] CreateCompanyRequest request, CancellationToken ct)
    {
        var result = await sender.Send(new CreateCompanyCommand(
            request.Name,
            request.CityId,
            request.SectorIds,
            request.Description,
            request.Address,
            request.Latitude,
            request.Longitude,
            request.Rccm,
            request.Niu,
            request.YearFounded
        ), ct);
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
    [AllowAnonymous]
    public async Task<IActionResult> GetCompanyById([FromRoute] Guid id, CancellationToken ct)
    {
        var result = await sender.Send(new GetCompanyByIdQuery(id,HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown"), ct);
        return result.Match(
            response => Ok(response),
            Problem
        );
    }

    [HttpGet("{slug}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Get a company by slug.")]
    [EndpointDescription("This endpoint gets a company by slug.")]
    [EndpointName("GetCompanyBySlug")]
    [MapToApiVersion("1.0")]
    [AllowAnonymous]
    public async Task<IActionResult> GetCompanyBySlug([FromRoute] string slug, CancellationToken ct)
    {
        var result = await sender.Send(new GetCompanyBySlugQuery(slug, HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown"), ct);
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
    [AllowAnonymous]
    public async Task<IActionResult> GetAllCompanies(
        [FromQuery] string? searchTerm = null,
        [FromQuery] Guid? sectorId = null,
        [FromQuery] string? sectorSlug = null,
        [FromQuery] Guid? cityId = null,
        [FromQuery] Guid? regionId = null,
        [FromQuery] int? status = null,
        [FromQuery] string? Rccm = null,
        [FromQuery] string? Niu = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] string? sortOrder = null,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken ct = default)
    {
        var result = await sender.Send(new GetCompaniesQuery(
            searchTerm,
            sectorId,
            sectorSlug,
            cityId,
            regionId,
            status,
            Rccm,
            Niu,
            sortBy,
            sortOrder,
            pageNumber,
            pageSize), ct);
        return result.Match(
            response => Ok(response),
            Problem
        );
    }

    [HttpPut("{id:guid}/update-company-profile" , Name = "UpdateCompanyProfile")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Update company profile by id.")]
    [EndpointDescription("This endpoint update company profile by id.")]
    [EndpointName("UpdateCompanyProfile")]
    [MapToApiVersion("1.0")]
    [Authorize(Roles = "Admin,EntrepriseOwner")]
    public async Task<IActionResult> UpdateCompanyProfile(Guid id, [FromBody] UpdateCompanyProfileRequest request, CancellationToken ct)
    {
        var result = await sender.Send(new UpdateCompanyProfileCommand(
            id,
            request.Name,
            request.Description,
            request.Website,
            request.CityId,
            request.Address,
            request.Latitude,
            request.Longitude,
            request.SectorIds,
            request.Rccm,
            request.Niu,
            request.YearFounded
        ), ct);
        return result.Match(
            response => Ok(response),
            Problem
        );
    }


    [HttpPut("{id:guid}/update-media" , Name = "UpdateMedia")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Update company media by id.")]
    [EndpointDescription("This endpoint update company media by id.")]
    [EndpointName("UpdateMedia")]
    [MapToApiVersion("1.0")]
    [Authorize(Roles = "Admin,EntrepriseOwner")]
    public async Task<IActionResult>UpdateMedia(Guid id, [FromBody] UpdateCompanyMediaRequest request, CancellationToken ct)
    {
        var result = await sender.Send(new UpdateMediaCommand(id,request.LogoUrl,request.CoverUrl),ct);
        return result.Match(
            response => Ok(response),
            Problem
        );
    }

     [HttpPost("{id:guid}/reactivate-company" , Name = "ReactivateCompany")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Reactivate a company by id.")]
    [EndpointDescription("This endpoint reactivate a company by id.")]
    [EndpointName("ReactivateCompany")]
    [MapToApiVersion("1.0")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult>ReactivateCompany([FromRoute] Guid id, CancellationToken ct)
    {
        var result = await sender.Send(new ReactivateCompanyCommand(id), ct);
        return result.Match(
            response => Ok(response),
            Problem
        );
    }

     [HttpPost("{id:guid}/reject-company" , Name = "RejectCompany")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Reject a company by id.")]
    [EndpointDescription("This endpoint reject a company by id.")]
    [EndpointName("RejectCompany")]
    [MapToApiVersion("1.0")]
    [Authorize(Roles = "Admin")]
     public async Task<IActionResult>RejectCompany([FromRoute] Guid id,[FromBody] RejectCompanyRequest request,CancellationToken ct)
     {
         var result = await sender.Send(new RejectCompanyCommand(id,request.Reason), ct);
        return result.Match(
            response => Ok(response),
            Problem
        );
    }

     [HttpPost("{id:guid}/submit-company" , Name = "SubmitCompany")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Submit a company by id.")]
    [EndpointDescription("This endpoint submit a company by id.")]
    [EndpointName("SubmitCompany")]
    [MapToApiVersion("1.0")]
    [Authorize(Roles = "Admin,EntrepriseOwner")]
    public async Task<IActionResult>SubmitCompany([FromRoute] Guid id, CancellationToken ct)
    {
        var result = await sender.Send(new SubmitCompanyCommand(id), ct);
        return result.Match(
            response => Ok(response),
            Problem
        );
    }

     [HttpPost("{id:guid}/suspend-company" , Name = "SuspendCompany")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Suspend a company by id.")]
    [EndpointDescription("This endpoint suspend a company by id.")]
    [EndpointName("SuspendCompany")]
    [MapToApiVersion("1.0")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult>SuspendCompany([FromRoute] Guid id, CancellationToken ct)
    {
        var result = await sender.Send(new SuspendCompanyCommand(id), ct);
        return result.Match(
            response => Ok(response),
            Problem
        );
    }

     [HttpPost("{id:guid}/validate-company" , Name = "ValidateCompany")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Validate a company by id.")]
    [EndpointDescription("This endpoint validate a company by id.")]
    [EndpointName("ValidateCompany")]
    [MapToApiVersion("1.0")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ValidateCompany(Guid id, CancellationToken ct)
    {
        var result = await sender.Send(new ValidateCompanyCommand(id), ct);
        return result.Match(
            response => Ok(response),
            Problem
        );
    }

    // Plan Management

    [HttpPost("{id:guid}/clear-active-subscription" , Name = "ClearActiveSubscription")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Clear active subscription for a company by id.")]
    [EndpointDescription("This endpoint clear active subscription for a company by id.")]
    [EndpointName("ClearActiveSubscription")]
    [MapToApiVersion("1.0")]
    [Authorize(Roles = "Admin,EntrepriseOwner")]
    public async Task<IActionResult>ClearActiveSubscription(Guid id, CancellationToken ct)
    {
        var result = await sender.Send(new ClearActiveSubscriptionCommand(id), ct);
        return result.Match(
            response => Ok(response),
            Problem
        );
    }


    [HttpPost("{id:guid}/set-active-subscription" , Name = "SetActiveSubscription")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Set active subscription for a company by id.")]
    [EndpointDescription("This endpoint set active subscription for a company by id.")]
    [EndpointName("SetActiveSubscription")]
    [MapToApiVersion("1.0")]
    [Authorize(Roles = "Admin,EntrepriseOwner")]

    public async Task<IActionResult> SetActiveSubscription(Guid id, [FromBody] Guid subscriptionId, CancellationToken ct)
    {
        var result = await sender.Send(new SetActiveSubscriptionCommand(id,subscriptionId), ct);
        return result.Match(
            response => Ok(response),
            Problem
        );
    }


    [HttpPost("{id:guid}/set-featured" , Name = "SetFeatured")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Set featured for a company by id.")]
    [EndpointDescription("This endpoint set featured for a company by id.")]
     [EndpointName("SetFeatured")]
    [MapToApiVersion("1.0")]
    [Authorize(Roles = "Admin,EntrepriseOwner")]
     public async Task<IActionResult> SetFeatured(Guid id,[FromBody] bool isFeatured, CancellationToken ct)
    {
        var result = await sender.Send(new SetFeatureCommand(id,isFeatured), ct);
        return result.Match(
            response => Ok(response),
            Problem
        );
    }

// ****************** Company Contacts ******************
[HttpPost("{id:guid}/add-contact" , Name = "AddContact")]
[ProducesResponseType(StatusCodes.Status200OK)]
[ProducesResponseType(StatusCodes.Status500InternalServerError)]
[EndpointSummary("Add contact for a company by id.")]
[EndpointDescription("This endpoint add contact for a company by id.")]
[EndpointName("AddContact")]
[MapToApiVersion("1.0")]
[Authorize(Roles ="EntrepriseOwner")]
public async Task<IActionResult> AddContact(Guid id, [FromBody] AddContactRequest commandRequest, CancellationToken ct)
{
    var command = new AddContactCommand(id,(Domain.Companies.Enums.ContactType)commandRequest.Type,commandRequest.Value,commandRequest.IsPrimary);
    var result = await sender.Send(command, ct);
    return result.Match(
        response => Ok(response),
        Problem
    );
}

[HttpDelete("{id:guid}/contacts/{contactId:guid}" , Name = "RemoveContact")]
[ProducesResponseType(StatusCodes.Status200OK)]
[ProducesResponseType(StatusCodes.Status500InternalServerError)]
[EndpointSummary("Remove contact for a company by id.")]
[EndpointDescription("This endpoint remove contact for a company by id.")]
[EndpointName("RemoveContact")]
[MapToApiVersion("1.0")]
[Authorize(Roles ="EntrepriseOwner")]
     public async Task<IActionResult> RemoveContact(Guid id, Guid contactId, CancellationToken ct)
{
    var command = new RemoveContactCommand(id, contactId);
    var result = await sender.Send(command, ct);
    return result.Match(
        response => Ok(response),
        Problem
    );
}

[HttpPut("{id:guid}/update-contact" , Name = "UpdateContact")]
[ProducesResponseType(StatusCodes.Status200OK)]
[ProducesResponseType(StatusCodes.Status500InternalServerError)]
[EndpointSummary("Update contact for a company by id.")]
[EndpointDescription("This endpoint update contact for a company by id.")]
[EndpointName("UpdateContact")]
[MapToApiVersion("1.0")]
[Authorize(Roles ="EntrepriseOwner")]
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

// ****************** Company Services ******************
[HttpPost("{id:guid}/add-service" , Name = "AddService")]
[ProducesResponseType(StatusCodes.Status200OK)]
[ProducesResponseType(StatusCodes.Status400BadRequest)]
[ProducesResponseType(StatusCodes.Status500InternalServerError)]
[EndpointSummary("Add service for a company by id.")]
[EndpointDescription("This endpoint add service for a company by id.")]
[EndpointName("AddService")]
[MapToApiVersion("1.0")]
[Authorize(Roles ="EntrepriseOwner")]
public async Task<IActionResult> AddService(Guid id, [FromBody] AddServiceRequest commandRequest, CancellationToken ct)
{
    var command = new AddServiceCommand(id,commandRequest.Title,commandRequest.Description);
    var result = await sender.Send(command, ct);
    return result.Match(
        response => Ok(response),
        Problem
    );
}

    [HttpDelete("{id:guid}/services/{serviceId:guid}" , Name = "RemoveService")]
[ProducesResponseType(StatusCodes.Status200OK)]
[ProducesResponseType(StatusCodes.Status400BadRequest)]
[ProducesResponseType(StatusCodes.Status500InternalServerError)]
[EndpointSummary("Remove service for a company by id.")]
[EndpointDescription("This endpoint remove service for a company by id.")]
[EndpointName("RemoveService")]
[MapToApiVersion("1.0")]
[Authorize(Roles ="EntrepriseOwner")]
      public async Task<IActionResult> RemoveService(Guid id, Guid serviceId, CancellationToken ct)
     {
         var command = new RemoveServiceCommand(id, serviceId);
    var result = await sender.Send(command, ct);
    return result.Match(
        response => Ok(response),
        Problem
    );
}
// ****************** Company Services ******************

// ****************** Company Reports ******************
[HttpPost("{id:guid}/add-report" , Name = "AddReport")]
[ProducesResponseType(StatusCodes.Status200OK)]
[ProducesResponseType(StatusCodes.Status400BadRequest)]
[ProducesResponseType(StatusCodes.Status500InternalServerError)]
[EndpointSummary("Add report for a company by id.")]
[EndpointDescription("This endpoint adds a report for a company by id.")]
[EndpointName("AddReport")]
[MapToApiVersion("1.0")]
// Allow both authenticated and anonymous users to report companies
[AllowAnonymous]
public async Task<IActionResult> AddReport(Guid id, [FromBody] AddReportRequest commandRequest, CancellationToken ct)
{
    var command = new AddReportCommand(id, HttpContext.Connection.RemoteIpAddress?.ToString() ?? string.Empty, commandRequest.Reason);
    var result = await sender.Send(command, ct);
    return result.Match(
        response => Ok(response),
        Problem
    );
}
// ****************** Company Reports ******************

// ****************** Company Images ******************
[HttpPost("{id:guid}/add-image" , Name = "AddImage")]
[ProducesResponseType(StatusCodes.Status200OK)]
[ProducesResponseType(StatusCodes.Status500InternalServerError)]
[EndpointSummary("Add image for a company by id.")]
[EndpointDescription("This endpoint add image for a company by id.")]
[EndpointName("AddImage")]
[MapToApiVersion("1.0")]
    [Authorize(Roles ="EntrepriseOwner")]
    public async Task<IActionResult> AddImage(Guid id, [FromBody] AddImageRequest commandRequest, CancellationToken ct)
{
    var result = await sender.Send(new AddImageCommand(id,commandRequest.ImageUrl,commandRequest.DisplayOrder,commandRequest.Caption), ct);
    return result.Match(
        response => Ok(response),
        Problem
    );
}


     [HttpDelete("{id:guid}/images/{imageId:guid}" , Name = "RemoveImage")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Remove image for a company by id.")]
    [EndpointDescription("This endpoint Remove image for a company by id.")]
    [EndpointName("RemoveImage")]
    [MapToApiVersion("1.0")]
    [Authorize(Roles ="EntrepriseOwner")]
     public async Task<IActionResult> RemoveImage(Guid id, Guid imageId, CancellationToken ct)
     {
         var result = await sender.Send(new RemoveImageCommand(id, imageId), ct);
        return result.Match(
            response => Ok(response),
            Problem
        );
    }
      // ****************** Company Images ******************

       // ****************** Company Documents ******************
    [HttpPost("{id:guid}/add-document" , Name = "AddDocument")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Add document for a company by id.")]
    [EndpointDescription("This endpoint adds a document for a company by id.")]
    [EndpointName("AddDocument")]
    [MapToApiVersion("1.0")]
    [Authorize(Roles ="EntrepriseOwner")]
    public async Task<IActionResult> AddDocument(Guid id, [FromBody] AddDocumentRequest commandRequest, CancellationToken ct)
    {
        if (!Enum.TryParse<DocumentType>(commandRequest.DocumentType, true, out var documentType))
        {
            return BadRequest($"Invalid document type: {commandRequest.DocumentType}");
        }
        
        var result = await sender.Send(new AddDocumentCommand(id, commandRequest.DocumentUrl, documentType, commandRequest.Description, commandRequest.IsPublic), ct);
        return result.Match(
            response => Ok(response),
            Problem
        );
    }


     [HttpDelete("{id:guid}/documents/{documentId:guid}" , Name = "RemoveDocument")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Remove document for a company by id.")]
    [EndpointDescription("This endpoint removes a document for a company by id.")]
    [EndpointName("RemoveDocument")]
    [MapToApiVersion("1.0")]
    [Authorize(Roles ="EntrepriseOwner")]
     public async Task<IActionResult> RemoveDocument(Guid id, Guid documentId, CancellationToken ct)
    {
        var command = new RemoveDocumentCommand(id, documentId);
        var result = await sender.Send(command, ct);
        return result.Match(
            response => Ok(response),
            Problem
        );
    }

    [HttpPost("{id:guid}/contact-click")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Track a contact click for a company.")]
    [EndpointDescription("This endpoint tracks when a user clicks on a contact method (phone, email, website, etc.).")]
    [EndpointName("TrackContactClick")]
    [MapToApiVersion("1.0")]
    [AllowAnonymous]
    public async Task<IActionResult> TrackContactClick(Guid id, [FromBody] TrackContactClickRequest request, CancellationToken ct)
    {
        var command = new TrackContactClickCommand(id, (ContactType)request.ContactType);
        var result = await sender.Send(command, ct);
        return result.Match(
            response => Ok(response),
            Problem
        );
    }
}
