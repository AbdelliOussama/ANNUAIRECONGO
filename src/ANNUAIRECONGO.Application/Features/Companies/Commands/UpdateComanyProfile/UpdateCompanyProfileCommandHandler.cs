using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Companies;
using MediatR;
using Microsoft.Extensions.Caching.Hybrid;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Companies.Commands.UpdateComanyProfile;

public sealed record UpdateCompanyProfileCommandHandler(ILogger<UpdateCompanyProfileCommandHandler> logger, IAppDbContext context, HybridCache cache) : IRequestHandler<UpdateCompanyProfileCommand, Result<Updated>>
{
    private readonly IAppDbContext _context = context;
    private readonly HybridCache _cache = cache;
    private readonly ILogger<UpdateCompanyProfileCommandHandler> _logger =logger;
    public async Task<Result<Updated>> Handle(UpdateCompanyProfileCommand request, CancellationToken cancellationToken)
    {
        var company = await _context.Companies.FindAsync(request.companyId);
        if (company is null)
            return CompanyErrors.CompanyNotFound(request.companyId);
        var companyUpdateProfileResult = company.UpdateProfile(request.name, request.description, request.website, request.cityId, request.address, request.latitude, request.longitude, request.sectorIds);
        if(companyUpdateProfileResult.IsError)
        {
            _logger.LogError("Error updating company profile: {Error}", companyUpdateProfileResult.Errors);
            return companyUpdateProfileResult.Errors;
        }
        await _context.SaveChangesAsync(cancellationToken);
        await _cache.RemoveByTagAsync("company");
        return Result.Updated;
    }
}