using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Companies;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Hybrid;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Companies.Commands.Contacts.UpdateContact;

public sealed record UpdateContactCommandHandler(
    ILogger<UpdateContactCommandHandler> logger,
    IAppDbContext context,
    HybridCache cache,
    IUser currentUser) : IRequestHandler<UpdateContactCommand, Result<Updated>>
{
    private readonly ILogger<UpdateContactCommandHandler> _logger = logger;
    private readonly IAppDbContext _context = context;
    private readonly HybridCache _cache = cache;
    private readonly IUser _currentUser = currentUser;

    public async Task<Result<Updated>> Handle(UpdateContactCommand request, CancellationToken cancellationToken)
    {
        var company = await _context.Companies.Include(c => c.Contacts)
                                            .FirstOrDefaultAsync(c => c.Id == request.CompanyId, cancellationToken);

        if (company is null)
        {
            _logger.LogWarning("Company with id {CompanyId} not found", request.CompanyId);
            return CompanyErrors.CompanyNotFound(request.CompanyId);
        }
        var isOwnedByCurrentUser = company.IsOwnedBy(_currentUser.Id);
        if (!isOwnedByCurrentUser)
        {
            _logger.LogWarning("Company with id = {CompanyId} is not owned by the current user with id = {UserId}",    request.CompanyId, _currentUser.Id);
            return CompanyErrors.NotOwner;
        }
        var companyContact = CompanyContact.Create(Guid.NewGuid(),request.Type,request.Value,request.IsPrimary);

        var result = company.UpdateContact(request.ContactId,companyContact.Value);
        if (result.IsError)
        {
            _logger.LogWarning("Failed to update contact for company with id {CompanyId}", request.CompanyId);
            return result.Errors;
        }

        await _context.SaveChangesAsync(cancellationToken);
        await _cache.RemoveByTagAsync("company");
        return Result.Updated;
    }
}