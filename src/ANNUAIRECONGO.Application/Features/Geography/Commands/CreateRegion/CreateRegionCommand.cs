using MediatR;
using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Application.Features.Geography.Dtos;

namespace ANNUAIRECONGO.Application.Features.Geography.Commands.CreateRegion;

public sealed record CreateRegionCommand(string Name) : IRequest<Result<RegionDto>>;