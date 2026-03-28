using ANNUAIRECONGO.Application.Common.Errors;
using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Sectors;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Hybrid;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Sectors.Commands.UpdateSector;

public sealed record UpdateSectorCommandHandler(ILogger<UpdateSectorCommandHandler> logger, IAppDbContext context, HybridCache cache) : IRequestHandler<UpdateSectorCommand, Result<Updated>>
{
    private readonly ILogger<UpdateSectorCommandHandler> _logger =logger;
    private readonly HybridCache _cache = cache;
    private readonly IAppDbContext _context = context;
    public async Task<Result<Updated>> Handle(UpdateSectorCommand request, CancellationToken cancellationToken)
    {
        var sector = await _context.Sectors.FirstOrDefaultAsync(s => s.Id == request.id );

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
        await _context.SaveChangesAsync(cancellationToken);

        await _cache.RemoveByTagAsync("sector",cancellationToken);

        return Result.Updated;
    }
}