using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Features.Stats.Dtos;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Companies;
using ANNUAIRECONGO.Domain.Geography;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ANNUAIRECONGO.Application.Features.Stats.Queries.GetRegionStats;

public sealed class GetRegionStatsQueryHandler(
    IAppDbContext context) : IRequestHandler<GetRegionStatsQuery, Result<List<RegionStatsDto>>>
{
    public async Task<Result<List<RegionStatsDto>>> Handle(GetRegionStatsQuery request, CancellationToken cancellationToken)
    {
        var regionStats = await context.Companies
            .Join(context.Cities, c => c.CityId, ci => ci.Id, (c, ci) => new { c.CityId, ci.RegionId })
            .Join(context.Regions, temp => temp.RegionId, r => r.Id, (temp, r) => new { r.Id, r.Name })
            .GroupBy(temp => new { temp.Id, temp.Name })
            .Select(g => new RegionStatsDto(
                g.Key.Id,
                g.Key.Name,
                g.Count()))
            .ToListAsync(cancellationToken);

        return regionStats;
    }
}