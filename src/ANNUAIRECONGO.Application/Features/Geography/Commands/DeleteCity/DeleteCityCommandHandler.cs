using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Geography;
using MediatR;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Geography.Commands.DeleteCity;

public sealed record DeleteCityCommandHandler(IAppDbContext Context, ILogger<DeleteCityCommandHandler> logger) : IRequestHandler<DeleteCityCommand, Result<Deleted>>
{
    private readonly IAppDbContext _context = Context;
    private readonly ILogger<DeleteCityCommandHandler> _logger = logger;
    public async Task<Result<Deleted>> Handle(DeleteCityCommand request, CancellationToken cancellationToken)
    {
        var city = await _context.Cities.FindAsync(request.Id, cancellationToken);
        if (city is null)
        {
            _logger.LogWarning("City with id {Id} not found", request.Id);
            return CityErrors.CityNotFound(request.Id);
        }

        _context.Cities.Remove(city);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("City with id {Id} deleted successfully", request.Id);
        return Result.Deleted;
    }
}