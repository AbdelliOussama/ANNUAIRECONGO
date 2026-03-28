using MediatR;
using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Geography;
using ANNUAIRECONGO.Application.Features.Geography.Dtos;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Caching.Hybrid;
using Microsoft.EntityFrameworkCore;
using ANNUAIRECONGO.Application.Features.Geography.Mappers;

namespace ANNUAIRECONGO.Application.Features.Geography.Commands.CreateCity;

public sealed class CreateCityCommandHandler(ILogger<CreateCityCommandHandler> logger,HybridCache cache,
    IAppDbContext context) : IRequestHandler<CreateCityCommand, Result<CityDto>>
{
    private readonly ILogger<CreateCityCommandHandler> _logger = logger;
    private readonly HybridCache _cache = cache;
    private readonly IAppDbContext _context = context;
    public async Task<Result<CityDto>> Handle(CreateCityCommand request, CancellationToken cancellationToken)
    {
        var cityExist = await _context.Cities.AnyAsync(c => EF.Functions.Like(c.Name , request.Name),cancellationToken);
        if(cityExist)
        {
            _logger.LogWarning("city with name {c} already Exists",request.Name);
            return CityErrors.NameAlreadyExists;
        }
        var cityResult = City.Create(Guid.NewGuid(), request.RegionId, request.Name);

        if (cityResult.IsError)
        {
            _logger.LogError("Error while creating city {c} , Errors = {e}",request.Name,cityResult.Errors);
            return cityResult.Errors;
        }

        var city = cityResult.Value;

        _context.Cities.Add(city);
        await _context.SaveChangesAsync(cancellationToken);
        await _cache.RemoveByTagAsync("cities");

        return city.ToDto();
    }
}