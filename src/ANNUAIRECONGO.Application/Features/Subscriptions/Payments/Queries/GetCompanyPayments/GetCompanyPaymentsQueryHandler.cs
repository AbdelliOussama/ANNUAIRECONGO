using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Features.Subscriptions.Payments.Dtos;
using ANNUAIRECONGO.Application.Features.Subscriptions.Payments.Mappers;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Companies;
using ANNUAIRECONGO.Domain.Subscriptions.Payments;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Subscriptions.Payments.Queries.GetCompanyPayments;

public sealed class GetCompanyPaymentsQueryHandler(ILogger<GetCompanyPaymentsQueryHandler> logger,IUser currentUser, IAppDbContext context) : IRequestHandler<GetCompanyPaymentsQuery, Result<List<PaymentDto>>>
{
    private readonly ILogger<GetCompanyPaymentsQueryHandler> _logger = logger;
    private readonly IAppDbContext _context = context;
    private readonly IUser _currentUser = currentUser;
    public async Task<Result<List<PaymentDto>>> Handle(GetCompanyPaymentsQuery request, CancellationToken cancellationToken)
    {
        var company = await _context.Companies
            .FirstOrDefaultAsync(c => c.Id == request.CompanyId, cancellationToken);

        if (company is null)
            return CompanyErrors.CompanyNotFound(request.CompanyId);
        if (!company.IsOwnedBy(_currentUser.Id!))
            return CompanyErrors.NotOwner;

        var payments = await _context.Payments
            .Include(p => p.Subscription)
            .ThenInclude(s => s.Company)
            .Where(p => p.CompanyId == request.CompanyId)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        if (payments is null || !payments.Any())
        {
            _logger.LogInformation("No payments found for company {CompanyId}", request.CompanyId);
            return new List<PaymentDto>();
        }

        return payments.ToDtos();
    }
}