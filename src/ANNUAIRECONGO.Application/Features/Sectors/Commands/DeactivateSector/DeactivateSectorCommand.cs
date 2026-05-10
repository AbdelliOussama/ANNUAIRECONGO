using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.Sectors.Commands.DeactivateSector;

public sealed record DeactivateSectorCommand(Guid Id) : IRequest<Result<Updated>>;