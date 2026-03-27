using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.Sectors.Commands;

public sealed record DeleteSectorCommand(Guid Id) : IRequest<Result<Deleted>>;