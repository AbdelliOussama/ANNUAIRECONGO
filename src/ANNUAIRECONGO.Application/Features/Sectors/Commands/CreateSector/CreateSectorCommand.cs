using ANNUAIRECONGO.Application.Features.Sectors.Dtos;
using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.Sectors.Commands;

public sealed record CreateSectorCommand(string Name,string IConUrl,string Description)
: IRequest<Result<SectorDto>>;