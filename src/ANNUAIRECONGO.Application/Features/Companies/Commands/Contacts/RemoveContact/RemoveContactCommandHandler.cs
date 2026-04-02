using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Companies;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Hybrid;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Companies.Commands.Contacts.RemoveContact;

public sealed record RemoveContactCommandHandler(
    ILogger<RemoveContactCommandHandler> Logger,
    IAppDbContext context,
    HybridCache cache,
    IUser currentUser) : IRequestHandler<RemoveContactCommand, Result<Updated>>
{
    private readonly IUser _currentUser = currentUser;
    private readonly ILogger<RemoveContactCommandHandler> _logger = Logger;
    private readonly IAppDbContext _context = context;
    private readonly HybridCache _cache = cache;
    public async Task<Result<Updated>> Handle(RemoveContactCommand request, CancellationToken cancellationToken)
    {
        var company = await _context.Companies.AsNoTracking().Include(c => c.Contacts)
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
        var contact = company.Contacts.FirstOrDefault(c => c.Id == request.ContactId);
        if (contact is null)
        {
            _logger.LogWarning("Contact with id = {ContactId} not found on company with id = {CompanyId}", request.ContactId, request.CompanyId);
            return CompanyErrors.ContactNotFound;
        }
        await _context.CompanyContacts.Where(c => c.Id == contact.Id).ExecuteDeleteAsync(cancellationToken);
        _logger.LogInformation("Contact with id = {ContactId} removed from company with id = {CompanyId}", request.ContactId, request.CompanyId);
        await _context.SaveChangesAsync(cancellationToken);
        await _cache.RemoveByTagAsync("company");
        return Result.Updated;
    }
}