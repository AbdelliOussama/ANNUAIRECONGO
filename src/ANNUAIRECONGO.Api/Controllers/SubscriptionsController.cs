using ANNUAIRECONGO.Application.Features.Subscriptions.Commands.CancelSubscription;
using ANNUAIRECONGO.Application.Features.Subscriptions.Payments.Commands.ConfirmPayment;
using ANNUAIRECONGO.Application.Features.Subscriptions.Queries.GetCompanySubscriptions;
using ANNUAIRECONGO.Application.Features.Subscriptions.Payments.Queries.GetCompanyPayments;
using ANNUAIRECONGO.Application.Common.Interfaces;
using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ANNUAIRECONGO.Application.Features.Subscriptions.Commands.Subscribe;
using ANNUAIRECONGO.Contracts.Requests.Subscriptions;
using ANNUAIRECONGO.Domain.Subscriptions.Payments.Enums;
using ANNUAIRECONGO.Application.Features.Subscriptions.Payments.Commands.RefundPayment;
using ANNUAIRECONGO.Application.Features.Subscriptions.Payments.Commands.RejectPayment;

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
    public async Task<IActionResult> CreateSubscription([FromBody] SubscribeRequest request, CancellationToken ct)
    {
        var result =await sender.Send(new SubscribeCommand(request.CompanyId, request.PlanId,(PaymentMethod) request.Method ),ct);
        return result.Match(
            response => CreatedAtAction(nameof(GetCompanySubscriptions), new { companyId = request.CompanyId }, response),
            Problem);
    }

    [HttpPut("{subscriptionId:guid}/cancel")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Cancel a company's active subscription.")]
    [EndpointDescription("This endpoint cancels the active subscription for a company.")]
    [EndpointName("CancelSubscription")]
    [MapToApiVersion("1.0")]
    public async Task<IActionResult> CancelSubscription([FromRoute] Guid subscriptionId, CancellationToken ct)
    {
        var result = await sender.Send(new CancelSubscriptionCommand(subscriptionId), ct);
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

        var result = await sender.Send(new GetCompanySubscriptionsQuery(companyId), ct);
        return result.Match(
            response => Ok(response),
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
    public async Task<IActionResult> ConfirmPayment([FromRoute] Guid paymentId,CancellationToken ct)
    {
        var command = new ConfirmPaymentCommand(paymentId);
        var result = await sender.Send(command, ct);
        return result.Match(
            response => Ok(response),
            Problem);
    }

    [HttpPut("payments/{paymentId:guid}/Refund")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status402PaymentRequired)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Refund a payment.")]
    [EndpointDescription("This endpoint refunds a payment with the payment gateway reference.")]
    [EndpointName("RefundPayment")]
    [MapToApiVersion("1.0")]
    public async Task<IActionResult> RefundPayment([FromRoute] Guid paymentId,  CancellationToken ct)
    {
        var command = new RefundPaymentCommand(paymentId);
        var result = await sender.Send(command, ct);
        return result.Match(
            response => Ok(response),
            Problem);
    }

    [HttpPut("payments/{paymentId:guid}/Reject")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status402PaymentRequired)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Reject a payment.")]
    [EndpointDescription("This endpoint rejects a payment with the payment gateway reference.")]
    [EndpointName("RejectPayment")]
    [MapToApiVersion("1.0")]
    public async Task<IActionResult> RejectPayment([FromRoute] Guid paymentId, [FromBody] string reason, CancellationToken ct)
    {
        var command = new RejectPaymentCommand(paymentId, reason);
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
        var result = await sender.Send(new GetCompanyPaymentsQuery(companyId), ct);
        return result.Match(
            response => Ok(response),
            Problem);
    }
}