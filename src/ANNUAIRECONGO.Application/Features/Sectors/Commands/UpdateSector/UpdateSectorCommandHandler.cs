using ANNUAIRECONGO.Application.Common.Errors;
using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Logs;
using ANNUAIRECONGO.Domain.Sectors;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Hybrid;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Sectors.Commands.UpdateSector;

public sealed record UpdateSectorCommandHandler(ILogger<UpdateSectorCommandHandler> logger, IAppDbContext context, HybridCache cache, IUser CurrentUser) : IRequestHandler<UpdateSectorCommand, Result<Updated>>
{
    private readonly ILogger<UpdateSectorCommandHandler> _logger =logger;
    private readonly HybridCache _cache = cache;
    private readonly IAppDbContext _context = context;
    private readonly IUser _currentUser = CurrentUser;
    public async Task<Result<Updated>> Handle(UpdateSectorCommand request, CancellationToken cancellationToken)
    {
        var sector = await _context.Sectors.FirstOrDefaultAsync(s => s.Id == request.id, cancellationToken );

        if(sector is null)
        {
            _logger.LogWarning("Sector with id = {1} not fund",request.id);
            return ApplicationErrors.SectorNotFound;
        }
        var UpdateSectorResult = sector.Update(request.Name,request.Description,request.IConUrl);
        if (UpdateSectorResult.IsError)
        {
            _logger.LogError("Failed to update sector {0} , errors: {1}",sector.Name,UpdateSectorResult.Errors);
            return UpdateSectorResult.Errors;
        }

        var adminLogResult = AdminLog.Create(
            _currentUser.Id,
            "updated_sector",
            AdminTargetTypes.Sector,
            sector.Id,
            $"Sector '{sector.Name}' updated by admin");

        if (!adminLogResult.IsError)
            await _context.AdminLogs.AddAsync(adminLogResult.Value, cancellationToken);
        else
            _logger.LogWarning("Could not create admin log for UpdateSector {SectorId}", request.id);

        await _context.SaveChangesAsync(cancellationToken);

        await _cache.RemoveByTagAsync("sector",cancellationToken);

        return Result.Updated;
    }
}