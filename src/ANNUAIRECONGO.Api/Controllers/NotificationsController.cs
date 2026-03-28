using ANNUAIRECONGO.Application.Features.Notifications.Commands.DeleteNotification;
using ANNUAIRECONGO.Application.Features.Notifications.Commands.MarkAllRead;
using ANNUAIRECONGO.Application.Features.Notifications.Commands.MarkAsRead;
using ANNUAIRECONGO.Application.Features.Notifications.Dtos;
using ANNUAIRECONGO.Application.Features.Notifications.Queries.GetMyNotifications;
using ANNUAIRECONGO.Application.Common.Interfaces;
using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ANNUAIRECONGO.Api.Controllers;

[Route("api/v{version:apiVersion}/notifications")]
[ApiVersion("1.0")]
[Authorize]
public sealed class NotificationsController(ISender sender, IUser currentUser) : ApiController
{
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Get current user's notifications.")]
    [EndpointDescription("This endpoint gets all notifications for the authenticated user.")]
    [EndpointName("GetMyNotifications")]
    [MapToApiVersion("1.0")]
    public async Task<IActionResult> GetMyNotifications(CancellationToken ct)
    {
        var result = await sender.Send(new GetMyNotificationsQuery(currentUser.Id!), ct);
        return result.Match(
            response => Ok(response),
            Problem);
    }

    [HttpPut("{id:guid}/read")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Mark a notification as read.")]
    [EndpointDescription("This endpoint marks a specific notification as read for the authenticated user.")]
    [EndpointName("MarkAsRead")]
    [MapToApiVersion("1.0")]
    public async Task<IActionResult> MarkAsRead([FromRoute] Guid id, CancellationToken ct)
    {
        var result = await sender.Send(new MarkAsReadCommand(id, currentUser.Id!), ct);
        return result.Match(
            response => Ok(response),
            Problem);
    }

    [HttpPut("read-all")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Mark all notifications as read.")]
    [EndpointDescription("This endpoint marks all notifications as read for the authenticated user.")]
    [EndpointName("MarkAllRead")]
    [MapToApiVersion("1.0")]
    public async Task<IActionResult> MarkAllRead(CancellationToken ct)
    {
        var result = await sender.Send(new MarkAllReadCommand(currentUser.Id!), ct);
        return result.Match(
            response => Ok(response),
            Problem);
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Delete a notification.")]
    [EndpointDescription("This endpoint deletes a specific notification for the authenticated user.")]
    [EndpointName("DeleteNotification")]
    [MapToApiVersion("1.0")]
    public async Task<IActionResult> DeleteNotification([FromRoute] Guid id, CancellationToken ct)
    {
        var result = await sender.Send(new DeleteNotificationCommand(id, currentUser.Id!), ct);
        return result.Match(
            response => Ok(response),
            Problem);
    }
}