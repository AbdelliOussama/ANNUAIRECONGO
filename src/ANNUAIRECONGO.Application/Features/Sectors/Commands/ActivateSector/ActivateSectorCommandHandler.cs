using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Sectors;
using MediatR;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Sectors.Commands.ActivateSector;

public sealed record ActivateSectorCommandHandler(IAppDbContext context, ILogger<ActivateSectorCommandHandler> logger)
: IRequestHandler<ActivateSectorCommand, Result<Updated>>
{
    private readonly IAppDbContext _context = context;
    private readonly ILogger<ActivateSectorCommandHandler> _logger = logger;

    public async  Task<Result<Updated>> Handle(ActivateSectorCommand request, CancellationToken cancellationToken)
    {
        var sector  = await _context.Sectors.FindAsync(new object[] { request.Id }, cancellationToken);
        if (sector is null)        {
            _logger.LogWarning("Sector with id {Id} not found", request.Id);
            return SectorErrors.SectorNotFound(request.Id);
        }
        var result = sector.Activate();
        if (result.IsError)
        {
            _logger.LogWarning("Failed to activate sector with id {Id}: {Error}", request.Id, result.TopError);
            return result;
        }
        await _context.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Sector with id {Id} activated successfully", request.Id);
        return result;
    }
}