using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Features.Sectors.Dtos;
using ANNUAIRECONGO.Application.Features.Sectors.Mappers;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Sectors;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Hybrid;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Sectors.Queries.GetSectorById;

public sealed record GetSectorByIdQueryHandler(ILogger<GetSectorByIdQueryHandler> logger, IAppDbContext context) : IRequestHandler<GetSectorByIdQuery, Result<SectorDto>>
{
    private readonly IAppDbContext _context = context;
    private readonly ILogger<GetSectorByIdQueryHandler> _logger = logger;
    public async Task<Result<SectorDto>> Handle(GetSectorByIdQuery request, CancellationToken cancellationToken)
    {
        var sector = await _context.Sectors.AsNoTracking().FirstOrDefaultAsync(s => s.Id == request.sectorId);
        if(sector is null)
        {
            _logger.LogWarning("Sector with id {SectorId} was not found", request.sectorId);

            return Error.NotFound(
                code: "Sector_NotFound",
                description: $"sector with id '{request.sectorId}' was not found");
        }
        return sector.ToDto();
    }
}