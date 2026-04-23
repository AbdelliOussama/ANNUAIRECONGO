using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Companies;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Companies.Commands.Follow.UnFollowCompany;

public sealed record UnFollowCommandHandler(IAppDbContext context, ILogger<UnFollowCommandHandler> logger) : IRequestHandler<UnfollowCompanyCommand, Result<Deleted>>
{
    private readonly IAppDbContext _context = context;
    private readonly ILogger<UnFollowCommandHandler> _logger = logger;

    public async Task<Result<Deleted>> Handle(UnfollowCompanyCommand request, CancellationToken cancellationToken)
    {
        var companyFollow = await _context.CompanyFollows.FirstOrDefaultAsync(cf => cf.Id == request.Id, cancellationToken);
        if (companyFollow is null)
        {
            _logger.LogWarning("Company follow with ID {CompanyFollowId} not found.", request.Id);
            return CompanyErrors.CompanyFollowNotFound(request.Id);
        }
        _context.CompanyFollows.Remove(companyFollow);
        await _context.SaveChangesAsync(cancellationToken);
        return Result.Deleted;
    }
}