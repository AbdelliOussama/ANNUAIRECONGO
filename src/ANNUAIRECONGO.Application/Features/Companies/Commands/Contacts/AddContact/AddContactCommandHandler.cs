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
        var company = await context.Companies.AsNoTracking().Include(c => c.Contacts)
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
        if(company.Contacts.Any(c => c.Value == request.Value && c.Type == request.Type))
        {
            _logger.LogWarning("Company with id = {CompanyId} already has a contact with value = {ContactValue} and type = {ContactType}", request.CompanyId, request.Value, request.Type);
            return CompanyErrors.ContactAlreadyExists;
        }
        var contactResult = CompanyContact.Create(request.CompanyId, request.Type, request.Value, request.IsPrimary);
        if (contactResult.IsError)
            return contactResult.Errors;
        await _context.CompanyContacts.AddAsync(contactResult.Value, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        await cache.RemoveByTagAsync("company");
        return Result.Updated;
    }
}