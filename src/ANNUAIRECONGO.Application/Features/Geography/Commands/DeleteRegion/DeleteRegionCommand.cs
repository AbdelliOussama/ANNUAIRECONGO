using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.Geography.Commands.DeleteRegion;

public sealed record DeleteRegionCommand(Guid Id) : IRequest<Result<Deleted>>;