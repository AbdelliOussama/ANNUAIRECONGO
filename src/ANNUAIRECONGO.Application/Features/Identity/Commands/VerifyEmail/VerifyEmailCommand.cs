using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.Identity.Commands.VerifyEmail;

/// <summary>
/// Confirms a user's email address using a token previously sent by e-mail.
/// Audit fix (May 2026 deep audit): FE /auth/verification-email expected this endpoint.
/// </summary>
public sealed record VerifyEmailCommand(string Email, string Token) : IRequest<Result<Success>>;
