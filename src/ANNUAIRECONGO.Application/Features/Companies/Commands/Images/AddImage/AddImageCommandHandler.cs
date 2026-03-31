using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Companies;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Companies.Commands.Images.AddImage;

public sealed record AddImageCommandHandler(ILogger<AddImageCommandHandler> logger,IAppDbContext context, IUser currentUser) : IRequestHandler<AddImageCommand,Result<Updated>>
{
    private readonly ILogger<AddImageCommandHandler> _logger = logger;
    private readonly IAppDbContext _context = context;
    private readonly IUser _currentUser = currentUser;

    public async Task<Result<Updated>> Handle(AddImageCommand request, CancellationToken cancellationToken)
    {
        var company  = await _context.Companies.FirstOrDefaultAsync(c =>c.Id == request.CompanyId, cancellationToken);
        if (company is null)
        {
            _logger.LogWarning("Company with id {CompanyId} not found", request.CompanyId);
            return CompanyErrors.CompanyNotFound(request.CompanyId);
        }
        var subscription = await _context.Subscriptions.AsNoTracking().Include(s => s.Plan).FirstOrDefaultAsync(s => s.CompanyId == request.CompanyId, cancellationToken);
        if (subscription is null)
        {
            _logger.LogWarning("Company with id {CompanyId} does not have a subscription ", request.CompanyId);
            return CompanyErrors.CompanyWithoutSubscription(request.CompanyId);
        }
        var isOwner =company.IsOwnedBy(_currentUser.Id);
        if (!isOwner)
        {
            _logger.LogWarning("User with id {UserId} is not the owner of company with id {CompanyId}", _currentUser.Id, request.CompanyId);
            return CompanyErrors.NotOwner;
        }
        var result = company.AddImage(request.ImageUrl, request.Caption, subscription.Plan);
        if(result.IsError)
        {
            _logger.LogWarning("Failed to add image to company with id {CompanyId}. Reason: {Reason}", request.CompanyId, result.Errors.First().Description);
            return result.Errors.First();
        }
        _logger.LogInformation("Image added to company with id {CompanyId}", request.CompanyId);
        await _context.SaveChangesAsync(cancellationToken);
        return Result.Updated;
    }
}