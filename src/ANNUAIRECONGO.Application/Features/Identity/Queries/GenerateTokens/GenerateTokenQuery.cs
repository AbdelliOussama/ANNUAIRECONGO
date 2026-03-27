using ANNUAIRECONGO.Domain.Common.Results;

using MediatR;

namespace ANNUAIRECONGO.Application.Features.Identity.Queries.GenerateTokens;

public record GenerateTokenQuery(string Email, string Password) : IRequest<Result<TokenResponse>>;
