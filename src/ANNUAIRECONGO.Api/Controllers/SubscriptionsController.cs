using ANNUAIRECONGO.Application.Features.Subscriptions.Commands.ActivateSubscription;
using ANNUAIRECONGO.Application.Features.Subscriptions.Commands.CancelSubscription;
using ANNUAIRECONGO.Application.Features.Subscriptions.Commands.CreateSubscription;
using ANNUAIRECONGO.Application.Features.Subscriptions.Payments.Commands.ConfirmPayment;
using ANNUAIRECONGO.Application.Features.Subscriptions.Payments.Commands.CreatePayment;
using ANNUAIRECONGO.Application.Features.Subscriptions.Payments.Dtos;
using ANNUAIRECONGO.Application.Features.Subscriptions.Queries.GetCompanySubscriptions;
using ANNUAIRECONGO.Application.Features.Subscriptions.Payments.Queries.GetCompanyPayments;
using ANNUAIRECONGO.Application.Common.Interfaces;
using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ANNUAIRECONGO.Api.Controllers;

[Route("api/v{version:apiVersion}/subscriptions")]
[ApiVersion("1.0")]
[Authorize]
public sealed class SubscriptionsController(ISender sender, IUser currentUser) : ApiController
{
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Create a new subscription.")]
    [EndpointDescription("This endpoint creates a new subscription for a company.")]
    [EndpointName("CreateSubscription")]
    [MapToApiVersion("1.0")]
    public async Task<IActionResult> CreateSubscription([FromBody] CreateSubscriptionCommand command, CancellationToken ct)
    {
        var result = await sender.Send(command with { CompanyId = Guid.Parse(currentUser.Id!) }, ct);
        return result.Match(
            response => Created($"/api/v1.0/subscriptions/{response.Id}", response),
            Problem);
    }

    [HttpPut("{companyId:guid}/cancel")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Cancel a company's active subscription.")]
    [EndpointDescription("This endpoint cancels the active subscription for a company.")]
    [EndpointName("CancelSubscription")]
    [MapToApiVersion("1.0")]
    public async Task<IActionResult> CancelSubscription([FromRoute] Guid companyId, CancellationToken ct)
    {
        // Verify the company belongs to the current user
        if (companyId != Guid.Parse(currentUser.Id!))
            return Forbid();

        var result = await sender.Send(new CancelSubscriptionCommand(companyId), ct);
        return result.Match(
            response => Ok(response),
            Problem);
    }

    [HttpPut("{companyId:guid}/activate")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Activate a company's subscription.")]
    [EndpointDescription("This endpoint activates a pending subscription for a company.")]
    [EndpointName("ActivateSubscription")]
    [MapToApiVersion("1.0")]
    public async Task<IActionResult> ActivateSubscription([FromRoute] Guid companyId, CancellationToken ct)
    {
        // Verify the company belongs to the current user
        if (companyId != Guid.Parse(currentUser.Id!))
            return Forbid();

        var result = await sender.Send(new ActivateSubscriptionCommand(companyId, currentUser.Id!), ct);
        return result.Match(
            response => Ok(response),
            Problem);
    }

    [HttpGet("company/{companyId:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Get a company's subscriptions.")]
    [EndpointDescription("This endpoint gets all subscriptions for a specific company.")]
    [EndpointName("GetCompanySubscriptions")]
    [MapToApiVersion("1.0")]
    public async Task<IActionResult> GetCompanySubscriptions([FromRoute] Guid companyId, CancellationToken ct)
    {
        // Verify the company belongs to the current user
        if (companyId != Guid.Parse(currentUser.Id!))
            return Forbid();

        var result = await sender.Send(new GetCompanySubscriptionsQuery(companyId), ct);
        return result.Match(
            response => Ok(response),
            Problem);
    }

    [HttpPost("payments")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status402PaymentRequired)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Create a new payment.")]
    [EndpointDescription("This endpoint creates a new payment for a subscription.")]
    [EndpointName("CreatePayment")]
    [MapToApiVersion("1.0")]
    public async Task<IActionResult> CreatePayment([FromBody] CreatePaymentCommand command, CancellationToken ct)
    {
        var result = await sender.Send(command, ct);
        return result.Match(
            response => Created($"/api/v1.0/subscriptions/payments/{response.Id}", response),
            Problem);
    }

    [HttpPut("payments/{paymentId:guid}/confirm")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status402PaymentRequired)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Confirm a payment.")]
    [EndpointDescription("This endpoint confirms a payment with the payment gateway reference.")]
    [EndpointName("ConfirmPayment")]
    [MapToApiVersion("1.0")]
    public async Task<IActionResult> ConfirmPayment([FromRoute] Guid paymentId, [FromBody] string gatewayReference, CancellationToken ct)
    {
        var command = new ConfirmPaymentCommand(paymentId);
        var result = await sender.Send(command, ct);
        return result.Match(
            response => Ok(response),
            Problem);
    }

    [HttpGet("payments/company/{companyId:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Get a company's payments.")]
    [EndpointDescription("This endpoint gets all payments for a specific company.")]
    [EndpointName("GetCompanyPayments")]
    [MapToApiVersion("1.0")]
    public async Task<IActionResult> GetCompanyPayments([FromRoute] Guid companyId, CancellationToken ct)
    {
        // Verify the company belongs to the current user
        if (companyId != Guid.Parse(currentUser.Id!))
            return Forbid();

        var result = await sender.Send(new GetCompanyPaymentsQuery(companyId), ct);
        return result.Match(
            response => Ok(response),
            Problem);
    }
}