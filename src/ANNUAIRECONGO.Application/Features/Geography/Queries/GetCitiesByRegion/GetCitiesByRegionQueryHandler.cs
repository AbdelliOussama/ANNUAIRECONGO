using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Features.Geography.Dtos;
using ANNUAIRECONGO.Application.Features.Geography.Mappers;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Geography;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Geography.Queries.GetCitiesByRegion;

public sealed class GetCitiesByRegionQueryHandler(ILogger<GetCitiesByRegionQueryHandler> logger,
    IAppDbContext context) : IRequestHandler<GetCitiesByRegionQuery, Result<List<CityDto>>>
{
    public async Task<Result<List<CityDto>>> Handle(GetCitiesByRegionQuery request, CancellationToken cancellationToken)
    {
        var cities = await context.Cities
            .Where(c => c.RegionId == request.RegionId)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
        if (cities == null || !cities.Any())
        {
            logger.LogWarning("No cities found for region with ID {RegionId}", request.RegionId);
            return CityErrors.CitiesNotFoundForRegion(request.RegionId);
        }

        return cities.ToDtos();
    }
}