using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Companies;
using ANNUAIRECONGO.Domain.Companies.Events;
using ANNUAIRECONGO.Domain.Logs;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Hybrid;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Companies.Commands.StatusTransition.ValidateCompany;

public sealed record ValidateCompanyCommandHandler(ILogger<ValidateCompanyCommandHandler> logger, IAppDbContext context, HybridCache cache,IUser CurrentUser) : IRequestHandler<ValidateCompanyCommand, Result<Updated>>
{
    private readonly ILogger<ValidateCompanyCommandHandler> _logger = logger;
    private readonly IAppDbContext _context = context;
    private readonly HybridCache _cache = cache;
    private readonly IUser _currentUser = CurrentUser;
    public async Task<Result<Updated>> Handle(ValidateCompanyCommand request, CancellationToken cancellationToken)
{
    var company = await _context.Companies
        .FirstOrDefaultAsync(x => x.Id == request.CompanyId, cancellationToken);

    if (company is null)
    {
        _logger.LogError("Company with id {CompanyId} not found", request.CompanyId);
        return CompanyErrors.CompanyNotFound(request.CompanyId);
    }

    var validationResult = company.Validate();
    if (validationResult.IsError)
    {
        _logger.LogError("Failed to validate company {CompanyId}", request.CompanyId);
        return validationResult.Errors;
    }

    company.AddDomainEvent(new CompanyValidatedEvent(
        company.Id, company.OwnerId.ToString(), company.Name));

    // ── Admin Log (non-blocking) ──────────────────────────────────
    var adminLogResult = AdminLog.Create(
        _currentUser.Id,
        AdminActions.ValidatedCompany,
        AdminTargetTypes.Company,
        company.Id,
        $"Company '{company.Name}' validated by admin");

    if (!adminLogResult.IsError)
        await _context.AdminLogs.AddAsync(adminLogResult.Value, cancellationToken);
    else
        _logger.LogWarning("Could not create admin log for ValidateCompany {CompanyId}", request.CompanyId);
    // ─────────────────────────────────────────────────────────────

    await _context.SaveChangesAsync(cancellationToken);
    await _cache.RemoveByTagAsync("Company");
    return Result.Updated;
}
}