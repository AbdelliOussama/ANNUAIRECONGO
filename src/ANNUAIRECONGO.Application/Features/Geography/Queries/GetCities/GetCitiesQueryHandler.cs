using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Features.Geography.Dtos;
using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ANNUAIRECONGO.Application.Features.Geography.Queries.GetCities;

public sealed class GetCitiesQueryHandler(IAppDbContext context)
    : IRequestHandler<GetCitiesQuery, Result<List<CityDto>>>
{
    public async Task<Result<List<CityDto>>> Handle(GetCitiesQuery request, CancellationToken cancellationToken)
    {
        var cities = await context.Cities
            .AsNoTracking()
            .Select(c => new CityDto
            {
                Id = c.Id,
                Name = c.Name,
                RegionId = c.RegionId
            })
            .OrderBy(c => c.Name)
            .ToListAsync(cancellationToken);

        return cities;
    }
}
