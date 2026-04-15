using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.Geography.Commands.DeleteCity;

public sealed record DeleteCityCommand(Guid Id) : IRequest<Result<Deleted>>;