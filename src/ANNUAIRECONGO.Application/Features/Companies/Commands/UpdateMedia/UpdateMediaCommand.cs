using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.Companies.Commands.UpdateMedia;

public sealed record UpdateMediaCommand(Guid id,string? logoUrl,string? coverUrl ) : IRequest<Result<Updated>>;
