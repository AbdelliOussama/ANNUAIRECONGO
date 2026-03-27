using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Features.BusinessOwners.Dtos;
using ANNUAIRECONGO.Application.Features.BusinessOwners.Mappers;
using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ANNUAIRECONGO.Application.Features.BusinessOwners.Queries.GetBusinessOwners;

public class GetBusinessOwnersQueryHandler : IRequestHandler<GetBusinessOwnersQuery, Result<List<BusinessOwnerDto>>>
{
    private readonly IAppDbContext _context;

    public GetBusinessOwnersQueryHandler(IAppDbContext context)
    {
        _context = context;
    }
    public async Task<Result<List<BusinessOwnerDto>>> Handle(GetBusinessOwnersQuery request, CancellationToken cancellationToken)
    {
        var businessOwners = await _context.BusinessOwners.AsNoTracking().ToListAsync();
        return businessOwners.ToDtos();
    }
}