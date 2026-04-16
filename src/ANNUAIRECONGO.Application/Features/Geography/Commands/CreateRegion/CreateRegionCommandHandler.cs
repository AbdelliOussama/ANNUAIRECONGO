using MediatR;
using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Geography;
using ANNUAIRECONGO.Domain.Logs;
using ANNUAIRECONGO.Application.Features.Geography.Dtos;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Caching.Hybrid;
using ANNUAIRECONGO.Application.Features.Geography.Mappers;

namespace ANNUAIRECONGO.Application.Features.Geography.Commands.CreateRegion;

public sealed class CreateRegionCommandHandler(ILogger<CreateRegionCommandHandler> logger,
    HybridCache cache,
    IAppDbContext context, IUser CurrentUser) : IRequestHandler<CreateRegionCommand, Result<RegionDto>>
{
    private readonly ILogger<CreateRegionCommandHandler> _logger = logger;
    private readonly HybridCache _cache = cache;
    private readonly IAppDbContext _context = context;
    private readonly IUser _currentUser = CurrentUser;
    public async Task<Result<RegionDto>> Handle(CreateRegionCommand request, CancellationToken cancellationToken)
    {
        var regionResult = Region.Create(Guid.NewGuid(), request.Name);

        if (regionResult.IsError)
        {
            _logger.LogError("Error while creating region {c} , Errors = {e}",request.Name,regionResult.Errors);
            return regionResult.Errors;
        }

        var region = regionResult.Value;

        _context.Regions.Add(region);

        var adminLogResult = AdminLog.Create(
            _currentUser.Id,
            "created_region",
            "Region",
            region.Id,
            $"Region '{request.Name}' created by admin");

        if (!adminLogResult.IsError)
            await _context.AdminLogs.AddAsync(adminLogResult.Value, cancellationToken);
        else
            _logger.LogWarning("Could not create admin log for CreateRegion {RegionName}", request.Name);

        await _context.SaveChangesAsync(cancellationToken);
        await _cache.RemoveByTagAsync("regions");

        return region.ToDto();
    }
}