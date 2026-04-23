using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Features.Companies.Dtos;
using ANNUAIRECONGO.Application.Features.Companies.Mappers;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Companies;
using MediatR;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Companies.Commands.Follow.FollowCompany;

public sealed record FollowCompanyCommandHandler(IAppDbContext context, ILogger<FollowCompanyCommandHandler> Logger, IUser currentUser) : IRequestHandler<FollowCompanyCommand, Result<CompanyFollowDto>>
{
    private readonly IAppDbContext _context = context;
    private readonly ILogger<FollowCompanyCommandHandler> _logger = Logger;
    private readonly IUser _currentUser = currentUser;

    public async Task<Result<CompanyFollowDto>> Handle(FollowCompanyCommand request, CancellationToken cancellationToken)
    {
        var company = _context.Companies.FirstOrDefault(c => c.Id == request.CompanyId);
        if (company is null)
        {
            _logger.LogWarning("Company with ID {CompanyId} not found.", request.CompanyId);
            return CompanyErrors.CompanyNotFound(request.CompanyId);
        }
        var CompanyFollowResult = CompanyFollow.Create(request.CompanyId,_currentUser.Id);
        if (CompanyFollowResult.IsError)
        {
            _logger.LogWarning("Failed to create company follow for Company ID {CompanyId} and User ID {UserId}. Errors: {Errors}", request.CompanyId, request.UserId, CompanyFollowResult.Errors);
            return CompanyFollowResult.Errors;
        }
        var companyFollow = CompanyFollowResult.Value;
        await _context.CompanyFollows.AddAsync(companyFollow, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return companyFollow.ToDto();
    }
}