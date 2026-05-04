using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.Identity.Commands.ForgotPassword;

public sealed record ForgotPasswordCommand(string Email) : IRequest<Result<Success>>;
