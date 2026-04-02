using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Companies;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Companies.Commands.Services.RemoveService;

public sealed record RemoveServiceCommandHandler(IAppDbContext Context, ILogger<RemoveServiceCommandHandler> logger, IUser user) : IRequestHandler<RemoveServiceCommand, Result<Updated>>
{
    private readonly IAppDbContext _context = Context;
    private readonly ILogger<RemoveServiceCommandHandler> _logger = logger;
    private readonly IUser _user = user;

    public async Task<Result<Updated>> Handle(RemoveServiceCommand request, CancellationToken cancellationToken)
    {
        var company = await _context.Companies.Include(c => c.Services).FirstOrDefaultAsync(c => c.Id == request.CompanyId, cancellationToken);

        if (company is null)
        {
            _logger.LogWarning("Company with id {CompanyId} not found", request.CompanyId);
            return CompanyErrors.CompanyNotFound(request.CompanyId);
        }
        var IsOwnedBy = company.IsOwnedBy(_user.Id);

        if (!IsOwnedBy)
        {
            _logger.LogWarning("User with id {UserId} is not the owner of company with id {CompanyId}", _user.Id, request.CompanyId);
            return CompanyErrors.NotOwner;
        }

        var result = company.RemoveService(request.ServiceId);
        if (result.IsError)
        {
            _logger.LogWarning("Failed to remove service with id {ServiceId} from company with id {CompanyId}. Errors: {Errors}", request.ServiceId, request.CompanyId, result.Errors);
            return result;
        }

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Service with id {ServiceId} removed from company with id {CompanyId}", request.ServiceId, request.CompanyId);

        return Result.Updated;
    }
}