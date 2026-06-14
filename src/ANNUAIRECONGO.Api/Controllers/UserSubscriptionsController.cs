using ANNUAIRECONGO.Application.Features.UserSubscriptions.Commands.Cancel;
using ANNUAIRECONGO.Application.Features.UserSubscriptions.Commands.Subscribe;
using ANNUAIRECONGO.Application.Features.UserSubscriptions.Dtos;
using ANNUAIRECONGO.Application.Features.UserSubscriptions.Queries.GetMyUserSubscription;
using ANNUAIRECONGO.Contracts.Requests.UserSubscriptions;
using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using DomainPaymentMethod = ANNUAIRECONGO.Domain.Subscriptions.Payments.Enums.PaymentMethod;

namespace ANNUAIRECONGO.Api.Controllers;

/// <summary>
/// Endpoints for <c>RegularUser</c> plan subscriptions (not company subscriptions).
/// All endpoints require the caller to be authenticated with the <c>RegularUser</c> role.
/// </summary>
[Route("user-subscriptions")]
[ApiVersionNeutral]
[Authorize(Roles = "RegularUser")]
public sealed class UserSubscriptionsController(ISender sender) : ApiController
{
    [HttpGet("my")]
    [ProducesResponseType(typeof(UserSubscriptionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [EndpointSummary("Gets the active/latest subscription of the current regular user.")]
    [EndpointName("GetMyUserSubscription")]
    public async Task<IActionResult> GetMy(CancellationToken ct)
    {
        var result = await sender.Send(new GetMyUserSubscriptionQuery(), ct);
        return result.Match(Ok, Problem);
    }

    [HttpPost("subscribe")]
    [ProducesResponseType(typeof(UserSubscriptionDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [EndpointSummary("Subscribes the current regular user to a plan.")]
    [EndpointDescription("Creates a UserSubscription. Free plans are activated immediately; paid plans remain Pending until admin confirmation.")]
    [EndpointName("SubscribeAsUser")]
    public async Task<IActionResult> Subscribe(
        [FromBody] SubscribeAsUserRequest request,
        CancellationToken ct)
    {
        // Map explicitly by name to avoid silent mismatches if either enum is ever extended.
        var domainMethod = request.Method switch
        {
            Contracts.Common.PaymentMethod.Stripe      => DomainPaymentMethod.Stripe,
            Contracts.Common.PaymentMethod.MTNMoMo     => DomainPaymentMethod.MTNMoMo,
            Contracts.Common.PaymentMethod.AirtelMoney => DomainPaymentMethod.AirtelMoney,
            _ => throw new ArgumentOutOfRangeException(nameof(request.Method), request.Method, "Unknown payment method.")
        };

        var result = await sender.Send(new SubscribeAsUserCommand(request.PlanId, domainMethod), ct);

        return result.Match(
            dto => Created($"/user-subscriptions/{dto.Id}", dto),
            Problem);
    }

    [HttpDelete("{subscriptionId:guid}/cancel")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [EndpointSummary("Cancels a user subscription.")]
    [EndpointName("CancelUserSubscription")]
    public async Task<IActionResult> Cancel(Guid subscriptionId, CancellationToken ct)
    {
        var result = await sender.Send(new CancelUserSubscriptionCommand(subscriptionId), ct);
        return result.Match(_ => NoContent(), Problem);
    }
}
