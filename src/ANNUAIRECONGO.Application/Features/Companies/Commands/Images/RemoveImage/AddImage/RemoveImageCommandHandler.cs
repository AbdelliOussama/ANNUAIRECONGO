using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Companies;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Companies.Commands.Images.RemoveImage;

public sealed record RemoveImageCommandHandler(ILogger<RemoveImageCommandHandler> logger,IAppDbContext context, IUser currentUser) : IRequestHandler<RemoveImageCommand,Result<Updated>>
{
    private readonly ILogger<RemoveImageCommandHandler> _logger = logger;
    private readonly IAppDbContext _context = context;
    private readonly IUser _currentUser = currentUser;

    public async Task<Result<Updated>> Handle(RemoveImageCommand request, CancellationToken cancellationToken)
    {
        var company  = await _context.Companies.FirstOrDefaultAsync(c =>c.Id == request.CompanyId, cancellationToken);
        if (company is null)
        {
            _logger.LogWarning("Company with id {CompanyId} not found", request.CompanyId);
            return CompanyErrors.CompanyNotFound(request.CompanyId);
        }
        var isOwner =company.IsOwnedBy(_currentUser.Id);
        if (!isOwner)
        {
            _logger.LogWarning("User with id {UserId} is not the owner of company with id {CompanyId}", _currentUser.Id, request.CompanyId);
            return CompanyErrors.NotOwner;
        }
        var result = company.RemoveImage(request.ImageId);
        if(result.IsError)
        {
            _logger.LogWarning("Failed to remove image from company with id {CompanyId}. Reason: {Reason}", request.CompanyId, result.Errors.First().Description);
            return result.Errors.First();
        }
        _logger.LogInformation("Image removed from company with id {CompanyId}", request.CompanyId);
        await _context.SaveChangesAsync(cancellationToken);
        return Result.Updated;
    }
}