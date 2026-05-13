using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Features.Subscriptions.Payments.Dtos;
using ANNUAIRECONGO.Application.Features.Subscriptions.Payments.Mappers;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Subscriptions.Payments.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ANNUAIRECONGO.Application.Features.Subscriptions.Payments.Queries.GetPendingPayments;

public sealed record GetPendingPaymentsQuery : IRequest<Result<List<PaymentDto>>>;

public sealed class GetPendingPaymentsQueryHandler(IAppDbContext context) : IRequestHandler<GetPendingPaymentsQuery, Result<List<PaymentDto>>>
{
    private readonly IAppDbContext _context = context;

    public async Task<Result<List<PaymentDto>>> Handle(GetPendingPaymentsQuery request, CancellationToken cancellationToken)
    {
        var payments = await _context.Payments
            .Include(p => p.Company)
            .Include(p => p.Subscription)
            .ThenInclude(s => s.Plan)
            .Where(p => p.Status == PaymentStatus.Pending)
            .OrderByDescending(p => p.CreatedAtUtc)
            .ToListAsync(cancellationToken);

        return payments.ToDtoList();
    }
}
