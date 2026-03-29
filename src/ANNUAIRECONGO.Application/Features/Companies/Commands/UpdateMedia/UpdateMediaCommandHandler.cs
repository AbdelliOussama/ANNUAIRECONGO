using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Companies;
using MediatR;
using Microsoft.Extensions.Caching.Hybrid;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Companies.Commands.UpdateMedia;

public sealed record UpdateMediaCommandHandler(
    ILogger<UpdateMediaCommandHandler> logger,
    HybridCache cache,
    IAppDbContext context,
    IUser currentUser) :
IRequestHandler<UpdateMediaCommand, Result<Updated>>
{
    private readonly ILogger<UpdateMediaCommandHandler>_logger = logger;
    private readonly HybridCache _cache = cache;
    private readonly IAppDbContext _context = context;
    private readonly IUser _currentUser = currentUser;
    public async Task<Result<Updated>> Handle(UpdateMediaCommand request, CancellationToken cancellationToken)
    {
        var company =await  _context.Companies.FindAsync(request.id);
        if (company is null)
        {
            _logger.LogWarning("Company with id {id} not found", request.id);
            return CompanyErrors.CompanyNotFound(request.id);
        }
        var isOwnedByCurrentUser = company.IsOwnedBy(_currentUser.Id);
        if (!isOwnedByCurrentUser)
        {
            _logger.LogWarning("Company with id = {CompanyId} is not owned by the current user with id = {UserId}",    request.id, _currentUser.Id);
            return CompanyErrors.NotOwner;
        }
        var UpdateMediaResult = company.UpdateMedia(request.logoUrl, request.coverUrl);
        if(UpdateMediaResult.IsError)
        {
            _logger.LogWarning("Failed to update media for company with id {id}", request.id);
            return UpdateMediaResult.Errors;
        }
        await _context.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Media updated for company with id {id}", request.id);
        await _cache.RemoveByTagAsync("company");
        return Result.Updated;
    }
}