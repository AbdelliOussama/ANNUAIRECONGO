using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Features.Geography.Dtos;
using ANNUAIRECONGO.Application.Features.Geography.Mappers;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Geography;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ANNUAIRECONGO.Application.Features.Geography.Queries.GetRegions;

public sealed class GetRegionsQueryHandler(
    IAppDbContext context) : IRequestHandler<GetRegionsQuery, Result<List<RegionDto>>>
{
    public async Task<Result<List<RegionDto>>> Handle(GetRegionsQuery request, CancellationToken cancellationToken)
    {
        var regions = await context.Regions
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        return regions.ToDtos();
    }
}