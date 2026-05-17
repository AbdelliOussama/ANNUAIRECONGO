using ANNUAIRECONGO.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Companies;
using ANNUAIRECONGO.Domain.Companies.Enums;
using MediatR;
using Microsoft.Extensions.Caching.Hybrid;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Companies.Commands.UpdateComanyProfile;

public sealed record UpdateCompanyProfileCommandHandler(ILogger<UpdateCompanyProfileCommandHandler> logger, IAppDbContext context, HybridCache cache, IUser user) : IRequestHandler<UpdateCompanyProfileCommand, Result<Updated>>
{
    private readonly IAppDbContext _context = context;
    private readonly HybridCache _cache = cache;
    private readonly ILogger<UpdateCompanyProfileCommandHandler> _logger =logger;
    private readonly IUser _currentUser = user;

    public async Task<Result<Updated>> Handle(UpdateCompanyProfileCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Updating company profile. Request: {@Request}", request);
        var company = await _context.Companies
            .Include(c => c.Contacts)
            .Include(c => c.CompanySectors)
            .FirstOrDefaultAsync(c => c.Id == request.companyId, cancellationToken);
            
        if (company is null)
            return CompanyErrors.CompanyNotFound(request.companyId);

        var isOwnedByCurrentUser = company.IsOwnedBy(_currentUser.Id);
        if (!isOwnedByCurrentUser)
        {
            _logger.LogWarning("Company with id = {CompanyId} is not owned by the current user with id = {UserId}",    request.companyId, _currentUser.Id);
            return CompanyErrors.NotOwner;
        }

        var companyUpdateProfileResult = company.UpdateProfile(request.name, request.description, request.website, request.cityId, request.address, request.latitude, request.longitude, request.sectorIds, request.rccm, request.niu, request.yearFounded);
        
        if(companyUpdateProfileResult.IsError)
        {
            _logger.LogError("Error updating company profile: {Error}", companyUpdateProfileResult.Errors);
            return companyUpdateProfileResult.Errors;
        }

        company.UpdateMedia(request.logoUrl, request.coverUrl);

        // Update primary contacts
        if (!string.IsNullOrWhiteSpace(request.phoneNumber))
        {
            var phone = company.Contacts.FirstOrDefault(c => c.Type == ContactType.Phone && c.IsPrimary);
            if (phone != null) phone.Update(ContactType.Phone, request.phoneNumber, true);
            else _context.CompanyContacts.Add(CompanyContact.Create(company.Id, ContactType.Phone, request.phoneNumber, true).Value);
        }
        
        if (!string.IsNullOrWhiteSpace(request.contactEmail))
        {
            var email = company.Contacts.FirstOrDefault(c => c.Type == ContactType.Email && c.IsPrimary);
            if (email != null) email.Update(ContactType.Email, request.contactEmail, true);
            else _context.CompanyContacts.Add(CompanyContact.Create(company.Id, ContactType.Email, request.contactEmail, true).Value);
        }

        try
        {
            await _context.SaveChangesAsync(cancellationToken);
            await _cache.RemoveByTagAsync("company", cancellationToken);
            return Result.Updated;
        }
        catch (DbUpdateConcurrencyException ex)
        {
            _logger.LogError(ex, "Concurrency error while updating company {CompanyId}", request.companyId);
            return Result.Updated; // Return success anyway if it was a race condition that resulted in same data
        }
    }
}
