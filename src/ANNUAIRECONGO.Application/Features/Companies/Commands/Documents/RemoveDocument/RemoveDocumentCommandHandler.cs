using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Companies;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Companies.Commands.Documents.RemoveDocument;

public sealed record RemoveDocumentCommandHandler(ILogger<RemoveDocumentCommandHandler> logger, IAppDbContext context, IUser currentUser) : IRequestHandler<RemoveDocumentCommand, Result<Updated>>
{
    private readonly ILogger<RemoveDocumentCommandHandler> _logger = logger;
    private readonly IAppDbContext _context = context;
    private readonly IUser _currentUser = currentUser;

    public async Task<Result<Updated>> Handle(RemoveDocumentCommand request, CancellationToken cancellationToken)
    {
        var company = await _context.Companies.FirstOrDefaultAsync(c => c.Id == request.CompanyId, cancellationToken);
        if (company is null)
        {
            _logger.LogWarning("Company with id {CompanyId} not found", request.CompanyId);
            return CompanyErrors.CompanyNotFound(request.CompanyId);
        }
        var isOwner = company.IsOwnedBy(_currentUser.Id);
        if (!isOwner)
        {
            _logger.LogWarning("User with id {UserId} is not the owner of company with id {CompanyId}", _currentUser.Id, request.CompanyId);
            return CompanyErrors.NotOwner;
        }
        var result = company.RemoveDocument(request.DocumentId);
        if (result.IsError)
        {
            _logger.LogWarning("Failed to remove document from company with id {CompanyId}. Reason: {Reason}", request.CompanyId, result.Errors.First().Description);
            return result.Errors.First();
        }
        _logger.LogInformation("Document removed from company with id {CompanyId}", request.CompanyId);
        await _context.SaveChangesAsync(cancellationToken);
        return Result.Updated;
    }
}