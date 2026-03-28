using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Features.Stats.Dtos;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Companies;
using ANNUAIRECONGO.Domain.Sectors;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ANNUAIRECONGO.Application.Features.Stats.Queries.GetSectorStats;

public sealed class GetSectorStatsQueryHandler(
    IAppDbContext context) : IRequestHandler<GetSectorStatsQuery, Result<List<SectorStatsDto>>>
{
    public async Task<Result<List<SectorStatsDto>>> Handle(GetSectorStatsQuery request, CancellationToken cancellationToken)
    {
        var sectorStats = await context.Companies
            .Join(context.CompanySectors, c => c.Id, cs => cs.CompanyId, (c, cs) => new { c.Id, cs.SectorId })
            .Join(context.Sectors, temp => temp.SectorId, s => s.Id, (temp, s) => new { s.Id, s.Name })
            .GroupBy(temp => new { temp.Id, temp.Name })
            .Select(g => new SectorStatsDto(
                g.Key.Id,
                g.Key.Name,
                g.Count()))
            .ToListAsync(cancellationToken);

        return sectorStats;
    }
}