using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Sectors;
using MediatR;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Sectors.Commands.DeactivateSector;

public sealed record DeactivateSectorCommandHandler(IAppDbContext context,ILogger<DeactivateSectorCommandHandler> logger) : IRequestHandler<DeactivateSectorCommand, Result<Updated>>
{
    private readonly IAppDbContext _context = context;
    private readonly ILogger<DeactivateSectorCommandHandler> _logger = logger;

    public async Task<Result<Updated>> Handle(DeactivateSectorCommand request, CancellationToken cancellationToken)
    {
       var  sector = await _context.Sectors.FindAsync(request.Id);
       if(sector == null)
       {
           _logger.LogWarning("Sector not found {Id}",request.Id);
           return SectorErrors.SectorNotFound(request.Id);     
       }
       var result = sector.Deactivate();
       if(result.IsError)
       {
           _logger.LogError("Failed to deactivate sector {Id}: {Error}",request.Id, result.TopError);
           return result;
       }
       await _context.SaveChangesAsync(cancellationToken);
       _logger.LogInformation("Sector deactivated successfully {Id}",request.Id);
       return Result.Updated;
    }
}
