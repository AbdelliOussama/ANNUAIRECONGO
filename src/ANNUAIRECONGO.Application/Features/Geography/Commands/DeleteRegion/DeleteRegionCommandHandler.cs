using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Geography;
using ANNUAIRECONGO.Domain.Logs;
using MediatR;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Geography.Commands.DeleteRegion;

public sealed record DeleteRegionCommandHandler(IAppDbContext Context, ILogger<DeleteRegionCommandHandler> logger, IUser CurrentUser) : IRequestHandler<DeleteRegionCommand, Result<Deleted>>
{
    private readonly IAppDbContext _context = Context;
    private readonly ILogger<DeleteRegionCommandHandler> _logger = logger;
    private readonly IUser _currentUser = CurrentUser;
    public async Task<Result<Deleted>> Handle(DeleteRegionCommand request, CancellationToken cancellationToken)
    {
        var region = await _context.Regions.FindAsync(request.Id, cancellationToken);
        if (region is null)
        {
            _logger.LogWarning("Region with id {Id} not found", request.Id);
            return RegionErrors.RegionNotFound(request.Id);
        }

        _context.Regions.Remove(region);

        var adminLogResult = AdminLog.Create(
            _currentUser.Id,
            "deleted_region",
            "Region",
            region.Id,
            $"Region '{region.Name}' deleted by admin");

        if (!adminLogResult.IsError)
            await _context.AdminLogs.AddAsync(adminLogResult.Value, cancellationToken);
        else
            _logger.LogWarning("Could not create admin log for DeleteRegion {RegionId}", request.Id);

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Region with id {Id} deleted successfully", request.Id);
        return Result.Deleted;
    }
}