using ANNUAIRECONGO.Application.Features.Geography.Dtos;
using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.Geography.Queries.GetCities;

public sealed record GetCitiesQuery : IRequest<Result<List<CityDto>>>;
