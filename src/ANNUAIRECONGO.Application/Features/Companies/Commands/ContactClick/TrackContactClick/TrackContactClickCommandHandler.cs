using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Companies;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Companies.Commands.ContactClick.TrackContactClick;

public sealed record TrackContactClickCommandHandler(IAppDbContext Context, ILogger<TrackContactClickCommandHandler> Logger) : IRequestHandler<TrackContactClickCommand, Result<Updated>>
{
    private readonly IAppDbContext _context = Context;
    private readonly ILogger<TrackContactClickCommandHandler> _logger = Logger;

    public async Task<Result<Updated>> Handle(TrackContactClickCommand request, CancellationToken cancellationToken)
    {
        var company = await _context.Companies.AsNoTracking().FirstOrDefaultAsync(c => c.Id == request.CompanyId, cancellationToken);

        if (company is null)
        {
            _logger.LogWarning("Company with id {CompanyId} not found", request.CompanyId);
            return CompanyErrors.CompanyNotFound(request.CompanyId);
        }
        var contactClick = Domain.Analytics.ContactClick.Create(request.CompanyId, request.ContactType);
        await _context.ContactClicks.AddAsync(contactClick.Value, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Contact click tracked for company {CompanyId}, type {ContactType}", request.CompanyId, request.ContactType);

        return Result.Updated;
    }
}