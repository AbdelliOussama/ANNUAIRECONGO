using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Companies;
using ANNUAIRECONGO.Domain.Companies.Events;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Hybrid;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Companies.Commands.StatusTransition.RejectCompany;
public sealed record RejectCompanyCommandHandler(ILogger<RejectCompanyCommandHandler> logger, IAppDbContext context, HybridCache cache) : IRequestHandler<RejectCompanyCommand, Result<Updated>>
{
    private readonly ILogger<RejectCompanyCommandHandler> _logger = logger;
    private readonly IAppDbContext _context = context;
    private readonly HybridCache _cache = cache;
    public async Task<Result<Updated>> Handle(RejectCompanyCommand request, CancellationToken cancellationToken)
    {
        var company = await _context.Companies.FirstOrDefaultAsync(c => c.Id == request.companyId, cancellationToken);

        if (company is null)
        {
            _logger.LogWarning("Company with id = {CompanyId} Not found", request.companyId);
            return CompanyErrors.CompanyNotFound(request.companyId);
        }
        var rejectResult = company.Reject(request.reason);
        if (rejectResult.IsError)
        {
            _logger.LogError("Failed To Reject Company with id = {CompanyId} , Errors = {2}", request.companyId,rejectResult.Errors);
            return rejectResult.Errors;
        }
        company.AddDomainEvent(new CompanyRejectedEvent(company.Id, company.OwnerId.ToString(), company.Name, company.RejectionReason));
        await _context.SaveChangesAsync(cancellationToken);
        await _cache.RemoveByTagAsync("Company", cancellationToken);
        return Result.Updated;
    }
}