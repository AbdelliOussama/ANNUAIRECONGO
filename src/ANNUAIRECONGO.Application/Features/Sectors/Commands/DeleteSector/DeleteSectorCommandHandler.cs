using ANNUAIRECONGO.Application.Common.Errors;
using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Logs;
using ANNUAIRECONGO.Domain.Sectors;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Hybrid;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Sectors.Commands.DeleteSector;

public sealed record DeleteSectorCommandHandler(
    ILogger<DeleteSectorCommandHandler> logger,
    IAppDbContext context,
    HybridCache cache,
    IUser CurrentUser) : IRequestHandler<DeleteSectorCommand, Result<Deleted>>
{
    private readonly ILogger<DeleteSectorCommandHandler> _logger = logger;
    private readonly HybridCache _cache = cache;
    private readonly IAppDbContext _context = context;
    private readonly IUser _currentUser = CurrentUser;

    public async Task<Result<Deleted>> Handle(DeleteSectorCommand request, CancellationToken cancellationToken)
    {
        var sector = await _context.Sectors.FirstOrDefaultAsync(s => s.Id == request.Id, cancellationToken);

        if (sector is null)
        {
            _logger.LogWarning("Sector with id = {Id} not found", request.Id);
            return ApplicationErrors.SectorNotFound;
        }

        _context.Sectors.Remove(sector);

        var adminLogResult = AdminLog.Create(
            _currentUser.Id,
            AdminActions.DeletedSector,
            AdminTargetTypes.Sector,
            sector.Id,
            $"Sector '{sector.Name}' deleted by admin");

        if (!adminLogResult.IsError)
            await _context.AdminLogs.AddAsync(adminLogResult.Value, cancellationToken);
        else
            _logger.LogWarning("Could not create admin log for DeleteSector {SectorId}", request.Id);

        await _context.SaveChangesAsync(cancellationToken);

        await _cache.RemoveByTagAsync("sector", cancellationToken);

        return Result.Deleted;
    }
}