using System.Security.Claims;
using ANNUAIRECONGO.Application.Features.Identity.Commands.ChangePassword;
using ANNUAIRECONGO.Application.Features.Identity.Commands.DeleteAccount;
using ANNUAIRECONGO.Application.Features.Identity.Commands.ForgotPassword;
using ANNUAIRECONGO.Application.Features.Identity.Commands.Register;
using ANNUAIRECONGO.Application.Features.Identity.Commands.ResendVerificationEmail;
using ANNUAIRECONGO.Application.Features.Identity.Commands.ResetPassword;
using ANNUAIRECONGO.Application.Features.Identity.Commands.UpdateProfile;
using ANNUAIRECONGO.Application.Features.Identity.Commands.VerifyEmail;
using ANNUAIRECONGO.Application.Features.Identity.Dtos;
using ANNUAIRECONGO.Application.Features.Identity.Queries.ExportData;
using ANNUAIRECONGO.Application.Features.Identity.Queries.GenerateTokens;
using ANNUAIRECONGO.Application.Features.Identity.Queries.GetUserInfo;
using ANNUAIRECONGO.Application.Features.Identity.Queries.RefreshTokens;
using ANNUAIRECONGO.Contracts.Requests.Identity;
using ANNUAIRECONGO.Contracts.Responses.Identity;
using ANNUAIRECONGO.Domain.Identity;
using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ANNUAIRECONGO.Api.Controllers;

[Route("identity")]
[ApiVersionNeutral]
public sealed class IdentityController(ISender sender) : ApiController
{
    [HttpPost("token/generate")]
    [ProducesResponseType(typeof(ANNUAIRECONGO.Contracts.Responses.Identity.TokenResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Generates an access and refresh token for a valid user.")]
    [EndpointDescription("Authenticates a user using provided credentials and returns a JWT token pair.")]
    [EndpointName("GenerateToken")]
    public async Task<IActionResult> GenerateToken([FromBody] LoginRequest request, CancellationToken ct)
    {
        var result = await sender.Send(new GenerateTokenQuery(request.Email, request.Password), ct);
        return result.Match(
            response => Ok(new ANNUAIRECONGO.Contracts.Responses.Identity.TokenResponse
            {
                AccessToken = response.AccessToken,
                RefreshToken = response.RefreshToken,
                ExpiresOnUtc = response.ExpiresOnUtc,
            }),
            Problem);
    }

    [HttpPost("token/refresh-token")]
    [ProducesResponseType(typeof(TokenResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Refreshes access token using a valid refresh token.")]
    [EndpointDescription("Exchanges an expired access token and a valid refresh token for a new token pair.")]
    [EndpointName("RefreshToken")]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request, CancellationToken ct)
    {
        var result = await sender.Send(new RefreshTokenQuery(request.RefreshToken, request.ExpiredAccessToken), ct);
        return result.Match(
            response => Ok(new TokenResponse
            {
                AccessToken = response.AccessToken,
                RefreshToken = response.RefreshToken,
                ExpiresOnUtc = response.ExpiresOnUtc,
            }),
            Problem);
    }

    [HttpGet("current-user/claims")]
    [Authorize]
    [ProducesResponseType(typeof(AppUserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Gets the current authenticated user's info.")]
    [EndpointDescription("Returns user information for the currently authenticated user based on the access token.")]
    [EndpointName("GetCurrentUserClaims")]
    public async Task<IActionResult> GetCurrentUserInfo(CancellationToken ct)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(userId))
        {
            return Problem([IdentityErrors.UserNotFound]);
        }

        var result = await sender.Send(new GetUserByIdQuery(userId), ct);

        return result.Match(
            response => Ok(response),
            Problem);
    }

    [HttpPost("register")]
    [ProducesResponseType(typeof(Guid), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Registers a new user and creates associated business owner profile.")]
    [EndpointDescription("Creates a new AppUser with BusinessOwner role and associated BusinessOwner profile.")]
    [EndpointName("Register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request, CancellationToken ct)
    {
        var result = await sender.Send(new RegisterCommand(
            request.Email,
            request.Password,
            request.FirstName,
            request.LastName,
            request.PhoneNumber,
            request.CompanyPosition,
            request.CompanyName,
            request.CityId,
            request.SectorIds,
            request.Website,
            request.Rccm,
            request.Niu),
            ct);

        return result.Match(
            userId => Created($"identity/{userId}", userId),
            Problem);
    }

    [HttpPost("forgot-password")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Sends password reset email.")]
    [EndpointDescription("Sends a password reset link to the user's registered email address.")]
    [EndpointName("ForgotPassword")]
    [AllowAnonymous]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request, CancellationToken ct)
    {
        var result = await sender.Send(new ForgotPasswordCommand(request.Email), ct);
        return result.Match(
            _ => Ok(),
            Problem);
    }

    [HttpPost("reset-password")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Resets user password with token.")]
    [EndpointDescription("Resets a user's password using a valid reset token sent via email.")]
    [EndpointName("ResetPassword")]
    [AllowAnonymous]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request, CancellationToken ct)
    {
        var result = await sender.Send(
            new ResetPasswordCommand(request.Email, request.Token, request.NewPassword),
            ct);
        return result.Match(
            _ => Ok(),
            Problem);
    }

    [HttpPost("verify-email")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Verifies user email with token.")]
    [EndpointDescription("Verifies a user's email address using a token sent during registration.")]
    [EndpointName("VerifyEmail")]
    [AllowAnonymous]
    public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailRequest request, CancellationToken ct)
    {
        var result = await sender.Send(new VerifyEmailCommand(request.Email, request.Token), ct);
        return result.Match(
            _ => Ok(),
            Problem);
    }

    [HttpPost("resend-verification-email")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Resends verification email.")]
    [EndpointDescription("Sends a new verification link to the user's registered email address.")]
    [EndpointName("ResendVerificationEmail")]
    [AllowAnonymous]
    public async Task<IActionResult> ResendVerificationEmail([FromBody] ResendVerificationEmailRequest request, CancellationToken ct)
    {
        var result = await sender.Send(new ResendVerificationEmailCommand(request.Email), ct);
        return result.Match(
            _ => Ok(),
            Problem);
    }

    [HttpPost("change-password")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Changes user password.")]
    [EndpointDescription("Changes the currently authenticated user's password.")]
    [EndpointName("ChangePassword")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request, CancellationToken ct)
    {
        var result = await sender.Send(
            new ChangePasswordCommand(request.CurrentPassword, request.NewPassword),
            ct);
        return result.Match(
            _ => Ok(),
            Problem);
    }

    [HttpDelete("delete-account")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Deletes user account.")]
    [EndpointDescription("Permanently deletes the currently authenticated user's account and associated profile data.")]
    [EndpointName("DeleteAccount")]
    public async Task<IActionResult> DeleteAccount(CancellationToken ct)
    {
        var result = await sender.Send(new DeleteAccountCommand(), ct);
        return result.Match(
            _ => NoContent(),
            Problem);
    }

    [HttpPut("profile")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Updates user profile.")]
    [EndpointDescription("Updates the personal and professional information of the currently authenticated user.")]
    [EndpointName("UpdateProfile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request, CancellationToken ct)
    {
        var result = await sender.Send(
            new UpdateProfileCommand(request.FirstName, request.LastName, request.PhoneNumber, request.CompanyPosition),
            ct);
        return result.Match(
            _ => Ok(),
            Problem);
    }

    [HttpGet("export-data")]
    [Authorize]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Exports user data.")]
    [EndpointDescription("Exports personal and company data of the currently authenticated user as JSON.")]
    [EndpointName("ExportData")]
    public async Task<IActionResult> ExportData(CancellationToken ct)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return Problem([IdentityErrors.UserNotFound]);
        }

        var result = await sender.Send(new ExportDataQuery(userId), ct);
        return result.Match(
            json => File(System.Text.Encoding.UTF8.GetBytes(json), "application/json", $"export_data_{DateTimeOffset.UtcNow:yyyyMMdd}.json"),
            Problem);
    }
}
