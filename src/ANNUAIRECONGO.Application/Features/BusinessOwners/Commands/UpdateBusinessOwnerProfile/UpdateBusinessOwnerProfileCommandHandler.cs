using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Domain.BusinessOwners;
using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.BusinessOwners.Commands.UpdateBusinessOwnerProfile;

public sealed record UpdateBusinessOwnerProfileCommandHandler(IAppDbContext Context, ILogger<UpdateBusinessOwnerProfileCommandHandler> logger, IUser currentUser) : IRequestHandler<UpdateBusinessOwnerProfileCommand, Result<Updated>>
{
    private readonly IAppDbContext _context = Context;
    private readonly ILogger<UpdateBusinessOwnerProfileCommandHandler> _logger = logger;
    private readonly IUser _currentUser = currentUser;
    public async Task<Result<Updated>> Handle(UpdateBusinessOwnerProfileCommand request, CancellationToken cancellationToken)
    {
        var businessOwner = await _context.BusinessOwners.FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
        if (businessOwner == null)
        {
            _logger.LogWarning("Business owner not found for ID: {Id}", request.Id);
            return BusinessOwnerErrors.NotFound(request.Id);
        }

        if (businessOwner.Id.ToString() != _currentUser.Id)
        {
            _logger.LogWarning("Unauthorized update attempt for business owner ID: {Id} by user ID: {UserId}", request.Id, _currentUser.Id);
            return BusinessOwnerErrors.NotOwner(request.Id);
        }
        var result =  businessOwner.UpdateProfile(request.FirstName, request.LastName, request.PhoneNumber,request.CompanyPosition);
        if(result.IsError)
        {
            _logger.LogWarning("Failed to update business owner profile for ID: {Id}. Error: {Error}", request.Id, result.Errors);
            return result.Errors;
        }
        await _context.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Successfully updated business owner profile for ID: {Id}", request.Id     );
        return Result.Updated;

    }
}