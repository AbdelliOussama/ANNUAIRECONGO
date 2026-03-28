using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Features.Geography.Dtos;
using ANNUAIRECONGO.Application.Features.Geography.Mappers;
using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ANNUAIRECONGO.Application.Features.Geography.Queries.GetCitiesByRegion;

public sealed class GetCitiesByRegionQueryHandler(
    IAppDbContext context) : IRequestHandler<GetCitiesByRegionQuery, Result<List<CityDto>>>
{
    public async Task<Result<List<CityDto>>> Handle(GetCitiesByRegionQuery request, CancellationToken cancellationToken)
    {
        var cities = await context.Cities
            .Where(c => c.RegionId == request.RegionId)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        return cities.ToDtos();
    }
}