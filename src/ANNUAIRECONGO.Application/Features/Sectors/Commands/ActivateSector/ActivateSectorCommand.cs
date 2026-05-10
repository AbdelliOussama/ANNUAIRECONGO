using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.Sectors.Commands.ActivateSector;
public sealed record ActivateSectorCommand(Guid Id) : IRequest<Result<Updated>>;
