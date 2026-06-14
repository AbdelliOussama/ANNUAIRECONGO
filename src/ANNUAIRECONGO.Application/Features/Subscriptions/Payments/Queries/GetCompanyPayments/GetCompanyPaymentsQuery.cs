using ANNUAIRECONGO.Application.Features.Subscriptions.Payments.Dtos;
using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.Subscriptions.Payments.Queries.GetCompanyPayments;

// NOTE: Previously implemented ICachedQuery<Result<List<PaymentDto>>> but HybridCache
// cannot serialize the Result<T> discriminated union → unhandled exception → HTTP 500.
// Payment data changes frequently so caching adds no value here.
public sealed record GetCompanyPaymentsQuery(Guid CompanyId, string? UserId)
    : IRequest<Result<List<PaymentDto>>>;
