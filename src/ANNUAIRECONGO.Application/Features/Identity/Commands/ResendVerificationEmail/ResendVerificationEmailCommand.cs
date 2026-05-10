using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.Identity.Commands.ResendVerificationEmail;

/// <summary>
/// Resends the email-confirmation link to a registered user. Returns Success
/// even when the e-mail does not exist, to prevent user enumeration.
/// </summary>
public sealed record ResendVerificationEmailCommand(string Email) : IRequest<Result<Success>>;
