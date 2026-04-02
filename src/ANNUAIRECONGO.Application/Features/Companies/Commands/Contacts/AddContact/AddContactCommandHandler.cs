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
    HybridCache cache,
    IUser currentUser) : IRequestHandler<AddContactCommand, Result<Updated>>
{
    private readonly ILogger<AddContactCommandHandler> _logger = logger;
    private readonly IAppDbContext _context = context;
    private readonly HybridCache _cache = cache;
    private readonly IUser _currentUser = currentUser;

    public async Task<Result<Updated>> Handle(AddContactCommand request, CancellationToken cancellationToken)
    {
        var company = await context.Companies.Include(c => c.Contacts)
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