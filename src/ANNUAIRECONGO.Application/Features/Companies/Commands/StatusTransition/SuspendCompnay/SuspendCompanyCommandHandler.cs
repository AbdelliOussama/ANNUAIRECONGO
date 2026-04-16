using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Companies;
using ANNUAIRECONGO.Domain.Companies.Events;
using ANNUAIRECONGO.Domain.Logs;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Hybrid;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Companies.Commands.StatusTransition.SuspendCompnay;
public sealed record SuspendCompanyCommandHandler(ILogger<SuspendCompanyCommandHandler> logger, IAppDbContext context, HybridCache cache, IUser CurrentUser) : IRequestHandler<SuspendCompanyCommand, Result<Updated>>
{
    private readonly ILogger<SuspendCompanyCommandHandler> _logger = logger;
    private readonly IAppDbContext _context = context;
    private readonly HybridCache _cache = cache;
    private readonly IUser _currentUser = CurrentUser;
    public async Task<Result<Updated>> Handle(SuspendCompanyCommand request, CancellationToken cancellationToken)
    {
        var company = await _context.Companies.FirstOrDefaultAsync(c => c.Id == request.companyId, cancellationToken);

        if (company is null)
        {
            _logger.LogWarning("Company with id = {CompanyId} Not found", request.companyId);
            return CompanyErrors.CompanyNotFound(request.companyId);
        }
        var suspendResult = company.Suspend();
        if (suspendResult.IsError)
        {
            return suspendResult.Errors;
        }
        company.AddDomainEvent(new CompanySuspendedEvent(company.Id, company.OwnerId.ToString(), company.Name));

        var adminLogResult = AdminLog.Create(
            _currentUser.Id,
            AdminActions.SuspendedCompany,
            AdminTargetTypes.Company,
            company.Id,
            $"Company '{company.Name}' suspended by admin");

        if (!adminLogResult.IsError)
            await _context.AdminLogs.AddAsync(adminLogResult.Value, cancellationToken);
        else
            _logger.LogWarning("Could not create admin log for SuspendCompany {CompanyId}", request.companyId);

        await _context.SaveChangesAsync(cancellationToken);
        await _cache.RemoveByTagAsync("Company", cancellationToken);
        return Result.Updated;
    }
}