using ANNUAIRECONGO.Application.Common.Errors;
using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Sectors;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Hybrid;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Sectors.Commands.DeleteSector;

public sealed record DeleteSectorCommandHandler(
    ILogger<DeleteSectorCommandHandler> logger,
    IAppDbContext context,
    HybridCache cache) : IRequestHandler<DeleteSectorCommand, Result<Deleted>>
{
    private readonly ILogger<DeleteSectorCommandHandler> _logger = logger;
    private readonly HybridCache _cache = cache;
    private readonly IAppDbContext _context = context;

    public async Task<Result<Deleted>> Handle(DeleteSectorCommand request, CancellationToken cancellationToken)
    {
        var sector = await _context.Sectors.FirstOrDefaultAsync(s => s.Id == request.Id, cancellationToken);

        if (sector is null)
        {
            _logger.LogWarning("Sector with id = {Id} not found", request.Id);
            return ApplicationErrors.SectorNotFound;
        }

        _context.Sectors.Remove(sector);
        await _context.SaveChangesAsync(cancellationToken);

        await _cache.RemoveByTagAsync("sector", cancellationToken);

        return Result.Deleted;
    }
}