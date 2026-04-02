using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Companies;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Companies.Commands.Services.AddService;

public sealed record AddServiceCommandHandler(IAppDbContext Context, ILogger<AddServiceCommandHandler> logger, IUser user) : IRequestHandler<AddServiceCommand, Result<Updated>>
{
    private readonly IAppDbContext _context = Context;
    private readonly ILogger<AddServiceCommandHandler> _logger = logger;
    private readonly IUser _user = user;

    public async Task<Result<Updated>> Handle(AddServiceCommand request, CancellationToken cancellationToken)
    {
        var company = await _context.Companies.FirstOrDefaultAsync(c => c.Id == request.CompanyId, cancellationToken);

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

        var service = CompanyService.Create(new Guid(), request.CompanyId, request.Title, request.Description);
        if (service.IsError)
        {
            _logger.LogWarning("Failed to create service for company with id {CompanyId}. Errors: {Errors}", request.CompanyId, service.Errors);
            return CompanyErrors.InvalidServiceData;
        }
        company.AddService(service.Value);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Service with id {ServiceId} added to company with id {CompanyId}", service.Value.Id, request.CompanyId);

        return Result.Updated;
    }
}