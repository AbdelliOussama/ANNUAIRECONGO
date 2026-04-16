using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Features.Sectors.Dtos;
using ANNUAIRECONGO.Application.Features.Sectors.Mappers;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Logs;
using ANNUAIRECONGO.Domain.Sectors;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Hybrid;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Sectors.Commands;

public sealed record CreateSectorCommandHandler(ILogger<CreateSectorCommandHandler> logger,HybridCache cache,IAppDbContext context, IUser CurrentUser) : IRequestHandler<CreateSectorCommand, Result<SectorDto>>
{
    private readonly ILogger<CreateSectorCommandHandler> _logger = logger;
    private readonly HybridCache _cache = cache;
    private readonly IAppDbContext _context = context;
    private readonly IUser _currentUser = CurrentUser;
    public async Task<Result<SectorDto>> Handle(CreateSectorCommand request, CancellationToken cancellationToken)
    {
        var existing = await context.Sectors.AnyAsync(s => s.Name == request.Name);
        if(existing)
        {
            _logger.LogWarning("Sector with name {Name} already exists", request.Name);
            return SectorErrors.NameAlreadyExists(request.Name);
        }
        var CreateSectorResult = Sector.Create(Guid.NewGuid(), request.Name, request.Description, request.IConUrl);
        if (CreateSectorResult.IsError)
        {
            return CreateSectorResult.Errors;
        }
        await _context.Sectors.AddAsync(CreateSectorResult.Value);

        var adminLogResult = AdminLog.Create(
            _currentUser.Id,
            AdminActions.CreatedSector,
            AdminTargetTypes.Sector,
            CreateSectorResult.Value.Id,
            $"Sector '{request.Name}' created by admin");

        if (!adminLogResult.IsError)
            await _context.AdminLogs.AddAsync(adminLogResult.Value, cancellationToken);
        else
            _logger.LogWarning("Could not create admin log for CreateSector {SectorName}", request.Name);

        await _context.SaveChangesAsync(cancellationToken);
        await _cache.RemoveByTagAsync("sector");

        var sector = CreateSectorResult.Value;
        return  sector.ToDto();
    }
}