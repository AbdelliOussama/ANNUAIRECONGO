using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Features.Companies.Commands.CreateCreditRating;
using ANNUAIRECONGO.Application.Features.Companies.Mappers;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Companies;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Companies.Commands.CreateCreditRating;

public sealed record CreateCreditRatingCommandHandler(IAppDbContext context, ILogger<CreateCreditRatingCommandHandler> logger,IUser currentUser) : IRequestHandler<CreateCreditRatingCommand, Result<CreditRatingDto>>
{
    private readonly IAppDbContext _context = context;
    private readonly ILogger<CreateCreditRatingCommandHandler> _logger = logger;
    private readonly IUser _currentUser = currentUser;

    public async Task<Result<CreditRatingDto>> Handle(CreateCreditRatingCommand request, CancellationToken cancellationToken)
    {
        var company = await _context.Companies.FirstOrDefaultAsync(c => c.Id == request.CompanyId, cancellationToken);
        if (company == null)
        {
            _logger.LogWarning("Company not found");
            return CompanyErrors.CompanyNotFound(request.CompanyId);
        }

        var CreateCreditRatingResult = CreditRatingQuery.Create(request.CompanyId, _currentUser.Id, request.Reason, request.creditRating, DateTimeOffset.UtcNow, request.AmountCharged);
        if(CreateCreditRatingResult.IsError)
        {
            _logger.LogWarning("Failed to create credit rating: {Error}", CreateCreditRatingResult.Errors);
            return CreateCreditRatingResult.Errors;
        }
        var creditRating = CreateCreditRatingResult.Value;
        await _context.CreditRatings.AddAsync(creditRating, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return creditRating.ToDto();
    }

}