using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Companies;
using ANNUAIRECONGO.Domain.Logs;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Hybrid;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Companies.Commands.StatusTransition.VerifyCompany;

public sealed record VerifyCompanyCommandHandler(
    ILogger<VerifyCompanyCommandHandler> logger,
    IAppDbContext context,
    HybridCache cache,
    IUser currentUser) : IRequestHandler<VerifyCompanyCommand, Result<Updated>>
{
    public async Task<Result<Updated>> Handle(VerifyCompanyCommand request, CancellationToken cancellationToken)
    {
        var company = await context.Companies
            .FirstOrDefaultAsync(x => x.Id == request.CompanyId, cancellationToken);

        if (company is null)
        {
            logger.LogError("Company with id {CompanyId} not found", request.CompanyId);
            return CompanyErrors.CompanyNotFound(request.CompanyId);
        }

        var result = company.Verify();
        if (result.IsError)
        {
            logger.LogError("Failed to verify company {CompanyId}: {Errors}", request.CompanyId, result.Errors);
            return result.Errors;
        }

        // ── Admin Log (non-blocking) ──────────────────────────────────
        var adminLogResult = AdminLog.Create(
            currentUser.Id,
            AdminActions.VerifiedCompany,
            AdminTargetTypes.Company,
            company.Id,
            $"Company '{company.Name}' identity verified by admin");

        if (!adminLogResult.IsError)
            await context.AdminLogs.AddAsync(adminLogResult.Value, cancellationToken);
        else
            logger.LogWarning("Could not create admin log for VerifyCompany {CompanyId}", request.CompanyId);
        // ─────────────────────────────────────────────────────────────

        await context.SaveChangesAsync(cancellationToken);
        await cache.RemoveByTagAsync("Company");
        return Result.Updated;
    }
}
