using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Features.Geography.Dtos;
using ANNUAIRECONGO.Application.Features.Geography.Mappers;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Geography;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Geography.Queries.GetRegions;

public sealed class GetRegionsQueryHandler(
    ILogger<GetRegionsQueryHandler> logger,
    IAppDbContext context) : IRequestHandler<GetRegionsQuery, Result<List<RegionDto>>>
{
    private readonly ILogger<GetRegionsQueryHandler> _logger = logger;
    private readonly IAppDbContext _context = context;


    public async Task<Result<List<RegionDto>>> Handle(GetRegionsQuery request, CancellationToken cancellationToken)
    {
        var regions = await _context.Regions
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        return regions.ToDtos();
    }
}