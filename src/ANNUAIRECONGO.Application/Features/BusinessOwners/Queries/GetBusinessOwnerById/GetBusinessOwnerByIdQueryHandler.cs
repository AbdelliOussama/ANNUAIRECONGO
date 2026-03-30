using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Features.BusinessOwners.Dtos;
using ANNUAIRECONGO.Application.Features.BusinessOwners.Mappers;
using ANNUAIRECONGO.Domain.BusinessOwners;
using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.BusinessOwners.Queries.GetBusinessOwnerById;

public sealed record GetBusinessOwnerByIdQueryHandler(IAppDbContext Context, ILogger<GetBusinessOwnerByIdQueryHandler> logger) :
IRequestHandler<GetBusinessOwnerByIdQuery,Result<BusinessOwnerDto>>
{
    private readonly IAppDbContext _context = Context;
    private readonly ILogger<GetBusinessOwnerByIdQueryHandler> _logger = logger;
    public async Task<Result<BusinessOwnerDto>> Handle(GetBusinessOwnerByIdQuery request, CancellationToken cancellationToken)
    {
        var businessOwner =await _context.BusinessOwners.AsNoTracking().FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
        if (businessOwner == null)
        {
            _logger.LogWarning("Business owner not found for ID: {Id}", request.Id);
            return BusinessOwnerErrors.NotFound(request.Id);
        }
        return businessOwner.ToDto();
    }
}