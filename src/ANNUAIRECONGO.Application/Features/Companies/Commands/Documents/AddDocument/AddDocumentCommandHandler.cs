using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Companies;
using ANNUAIRECONGO.Domain.Companies.Enums;
using ANNUAIRECONGO.Domain.Subscriptions.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Companies.Commands.Documents.AddDocument;

public sealed record AddDocumentCommandHandler(ILogger<AddDocumentCommandHandler> logger, IAppDbContext context, IUser currentUser) : IRequestHandler<AddDocumentCommand, Result<Updated>>
{
    private readonly ILogger<AddDocumentCommandHandler> _logger = logger;
    private readonly IAppDbContext _context = context;
    private readonly IUser _currentUser = currentUser;

    public async Task<Result<Updated>> Handle(AddDocumentCommand request, CancellationToken cancellationToken)
    {
        var company = await _context.Companies.AsNoTracking().Include(c => c.Documents).FirstOrDefaultAsync(c => c.Id == request.CompanyId, cancellationToken);
        if (company is null)
        {
            _logger.LogWarning("Company with id {CompanyId} not found", request.CompanyId);
            return CompanyErrors.CompanyNotFound(request.CompanyId);
        }
        var subscription = await _context.Subscriptions.AsNoTracking()
            .Include(s => s.Plan)
            .Where(s => s.Status == SubscriptionStatus.Active || s.Status == SubscriptionStatus.ExpiringSoon)
            .FirstOrDefaultAsync(s => s.CompanyId == request.CompanyId, cancellationToken);
        if (subscription is null)
        {
            _logger.LogWarning("Company with id {CompanyId} does not have a subscription ", request.CompanyId);
            return CompanyErrors.CompanyWithoutSubscription(request.CompanyId);
        }
        var isOwner = company.IsOwnedBy(_currentUser.Id);
        if (!isOwner)
        {
            _logger.LogWarning("User with id {UserId} is not the owner of company with id {CompanyId}", _currentUser.Id, request.CompanyId);
            return CompanyErrors.NotOwner;
        }

        var document = CompanyDocument.Create(request.CompanyId,(DocumentType)Enum.Parse(typeof(DocumentType), request.DocumentType, true),request.DocumentUrl,request.isPublic);
        _logger.LogInformation("Document added to company with id {CompanyId}", request.CompanyId);
        await _context.SaveChangesAsync(cancellationToken);
        return Result.Updated;
    }
}