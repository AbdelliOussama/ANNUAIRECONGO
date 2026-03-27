using ANNUAIRECONGO.Application.Common.Errors;
using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Features.Sectors.Dtos;
using ANNUAIRECONGO.Application.Features.Sectors.Mappers;
using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Hybrid;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Sectors.Queries.GetSectors;

public sealed record GetSectorsQueryHandler(ILogger<GetSectorsQueryHandler> logger, IAppDbContext context) : IRequestHandler<GetSectorsQuery, Result<List<SectorDto>>>
{
    private readonly IAppDbContext _context = context;
    private readonly ILogger<GetSectorsQueryHandler> _logger = logger;
    public async Task<Result<List<SectorDto>>> Handle(GetSectorsQuery request, CancellationToken cancellationToken)
    {
        var sectors = await _context.Sectors.AsNoTracking().OrderBy(s => s.Name).ToListAsync(cancellationToken);
        if(sectors == null)
        {
            _logger.LogWarning("No sectors found");
            return ApplicationErrors.sectorsNotFound;
        }
        return sectors.Select(s => s.ToDto()).ToList();
    }
}