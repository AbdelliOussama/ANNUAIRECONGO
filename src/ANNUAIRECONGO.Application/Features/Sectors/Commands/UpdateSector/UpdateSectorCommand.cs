using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.Sectors.Commands;

public  sealed record UpdateSectorCommand(Guid id,string Name,string IConUrl,string Description) : IRequest<Result<Updated>>;