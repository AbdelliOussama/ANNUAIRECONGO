using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Companies;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Hybrid;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Companies.Commands.Contacts.AddContact;

public sealed record AddContactCommandHandler(
    ILogger<AddContactCommandHandler> logger,
    IAppDbContext context,
    HybridCache cache) : IRequestHandler<AddContactCommand, Result<Updated>>
{
    private readonly ILogger<AddContactCommandHandler> _logger = logger;
    private readonly IAppDbContext _context = context;
    private readonly HybridCache _cache = cache;

    public async Task<Result<Updated>> Handle(AddContactCommand request, CancellationToken cancellationToken)
    {
        var company = await context.Companies
            .FirstOrDefaultAsync(c => c.Id == request.CompanyId, cancellationToken);

        if (company is null)
        {
            _logger.LogWarning("Company with id {CompanyId} not found", request.CompanyId);
            return CompanyErrors.CompanyNotFound(request.CompanyId);
        }
        
        var contactResult = CompanyContact.Create(request.CompanyId, request.Type, request.Value, request.IsPrimary);
        if (contactResult.IsError)
            return contactResult.Errors;

        var result = company.AddContact(contactResult.Value);
        if (result.IsError)
        {
            _logger.LogError("Failed to add contact to company with id {CompanyId} Errors = {2}", request.CompanyId,result.Errors);
            return result.Errors;
        }

        await _context.SaveChangesAsync(cancellationToken);
        await cache.RemoveByTagAsync("company");
        return Result.Updated;
    }
}