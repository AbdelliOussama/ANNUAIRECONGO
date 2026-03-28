using MediatR;
using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Geography;
using ANNUAIRECONGO.Application.Features.Geography.Dtos;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Caching.Hybrid;
using ANNUAIRECONGO.Application.Features.Geography.Mappers;

namespace ANNUAIRECONGO.Application.Features.Geography.Commands.CreateRegion;

public sealed class CreateRegionCommandHandler(ILogger<CreateRegionCommandHandler> logger,
    HybridCache cache,
    IAppDbContext context) : IRequestHandler<CreateRegionCommand, Result<RegionDto>>
{
    private readonly ILogger<CreateRegionCommandHandler> _logger;
    private readonly HybridCache _cache;
    private readonly IAppDbContext _context;
    public async Task<Result<RegionDto>> Handle(CreateRegionCommand request, CancellationToken cancellationToken)
    {
        var regionResult = Region.Create(Guid.NewGuid(), request.Name);

        if (regionResult.IsError)
            return regionResult.Errors;

        var region = regionResult.Value;

        _context.Regions.Add(region);
        await _context.SaveChangesAsync(cancellationToken);

        return region.ToDto();
    }
}