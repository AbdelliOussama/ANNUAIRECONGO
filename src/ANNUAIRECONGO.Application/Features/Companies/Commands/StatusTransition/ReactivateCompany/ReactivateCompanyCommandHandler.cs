using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Companies;
using ANNUAIRECONGO.Domain.Companies.Events;
using ANNUAIRECONGO.Domain.Logs;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Hybrid;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Companies.Commands.StatusTransition.ReactivateCompany;
public sealed record ReactivateCompanyCommandHandler(ILogger<ReactivateCompanyCommandHandler> logger, IAppDbContext context, HybridCache cache, IUser CurrentUser) : IRequestHandler<ReactivateCompanyCommand, Result<Updated>>
{
    private readonly ILogger<ReactivateCompanyCommandHandler> _logger = logger;
    private readonly IAppDbContext _context = context;
    private readonly HybridCache _cache = cache;
    private readonly IUser _currentUser = CurrentUser;
    public async Task<Result<Updated>> Handle(ReactivateCompanyCommand request, CancellationToken cancellationToken)
    {
        var company = await _context.Companies.FirstOrDefaultAsync(c => c.Id == request.companyId, cancellationToken);

        if (company is null)
        {
            _logger.LogWarning("Company with id = {CompanyId} Not found", request.companyId);
            return CompanyErrors.CompanyNotFound(request.companyId);
        }
        var reactivateResult = company.Reactivate();
        if (reactivateResult.IsError)
        {
            _logger.LogError("Failed To Reactivate Company with id = {CompanyId} , Errors = {2}", request.companyId,reactivateResult.Errors);
            return reactivateResult.Errors;
        }
        company.AddDomainEvent(new CompanyReactivatedEvent(company.Id, company.OwnerId.ToString(), company.Name) );

        var adminLogResult = AdminLog.Create(
            _currentUser.Id,
            AdminActions.ReactivatedCompany,
            AdminTargetTypes.Company,
            company.Id,
            $"Company '{company.Name}' reactivated by admin");

        if (!adminLogResult.IsError)
            await _context.AdminLogs.AddAsync(adminLogResult.Value, cancellationToken);
        else
            _logger.LogWarning("Could not create admin log for ReactivateCompany {CompanyId}", request.companyId);

        await _context.SaveChangesAsync(cancellationToken);
        await _cache.RemoveByTagAsync("Company", cancellationToken);
        return Result.Updated;
    }
}