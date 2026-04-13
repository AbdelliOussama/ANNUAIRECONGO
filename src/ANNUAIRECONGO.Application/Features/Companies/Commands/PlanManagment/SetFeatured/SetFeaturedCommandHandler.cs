using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Companies;
using MediatR;
using MediatR.Pipeline;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Hybrid;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Companies.Commands.PlanManagment.SetFeatured;

public sealed record SetFeaturedCommandHandler(
    ILogger<SetFeaturedCommandHandler> logger,
    IAppDbContext context,
    HybridCache cache,
    IUser currentUser) : IRequestHandler<SetFeatureCommand,Result<Updated>>
{
    private readonly ILogger<SetFeaturedCommandHandler> _logger = logger;
    private readonly IAppDbContext _context = context;
    private readonly HybridCache _cache = cache;
    private readonly IUser _currentUser = currentUser;

    public async Task<Result<Updated>> Handle(SetFeatureCommand request, CancellationToken cancellationToken)
    {
        var company =await _context.Companies.FirstOrDefaultAsync(c => c.Id == request.CompanyId, cancellationToken);
        if (company is null)
        {
            _logger.LogWarning("Company not found");
            return CompanyErrors.CompanyNotFound(request.CompanyId);
        }
        var isOwnedByCurrentUser = company.IsOwnedBy(_currentUser.Id);
        if (!isOwnedByCurrentUser)
        {
            _logger.LogWarning("Company with id = {CompanyId} is not owned by the current user with id = {UserId}",    request.CompanyId, _currentUser.Id);
            return CompanyErrors.NotOwner;
        }
        var result =company.SetFeatured(request.IsFeatured);
        if(result.IsError)
        {
            _logger.LogError("Failed to set featured company Errors = {0}",result.Errors);
            return result.Errors;
        }
        await _context.SaveChangesAsync(cancellationToken);
        await _cache.RemoveByTagAsync("company");
        return Result.Updated;
    }
}