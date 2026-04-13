using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Companies;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Hybrid;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Companies.Commands.StatusTransition.SubmitCompany;
public sealed record SubmitCompanyCommandHandler(ILogger<SubmitCompanyCommandHandler> logger, IAppDbContext context, HybridCache cache, IUser currentUser) : IRequestHandler<SubmitCompanyCommand, Result<Updated>>
{
    private readonly IAppDbContext _context = context;
    private readonly ILogger<SubmitCompanyCommandHandler> _logger = logger;
    private readonly HybridCache _cache = cache;
    private readonly IUser _currentUser = currentUser;
    public async Task<Result<Updated>> Handle(SubmitCompanyCommand request, CancellationToken cancellationToken)
    {
        var company = await _context.Companies.FirstOrDefaultAsync(c => c.Id == request.companyId, cancellationToken);

        if (company is null)
        {
            _logger.LogWarning("Company with id = {CompanyId} Not found", request.companyId);
            return CompanyErrors.CompanyNotFound(request.companyId);
        }
        var isOwnedByCurrentUser = company.IsOwnedBy(_currentUser.Id);
        if (!isOwnedByCurrentUser)
        {
            _logger.LogWarning("Company with id = {CompanyId} is not owned by the current user with id = {UserId}",    request.companyId, _currentUser.Id);
            return CompanyErrors.NotOwner;
        }
        var submitCompanyResult = company.Submit();
        if (submitCompanyResult.IsError)
        {
            return submitCompanyResult.Errors;
        }
        await _context.SaveChangesAsync(cancellationToken);
        await _cache.RemoveByTagAsync("Company", cancellationToken);
        return Result.Updated;
    }
}