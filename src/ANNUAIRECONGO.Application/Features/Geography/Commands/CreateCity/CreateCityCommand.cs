using MediatR;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Application.Features.Geography.Dtos;

namespace ANNUAIRECONGO.Application.Features.Geography.Commands.CreateCity;

public sealed record CreateCityCommand(string Name, Guid RegionId) : IRequest<Result<CityDto>>;