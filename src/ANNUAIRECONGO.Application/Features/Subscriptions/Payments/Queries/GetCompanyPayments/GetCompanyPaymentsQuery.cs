using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Features.Subscriptions.Payments.Dtos;
using ANNUAIRECONGO.Domain.Common.Results;

namespace ANNUAIRECONGO.Application.Features.Subscriptions.Payments.Queries.GetCompanyPayments;

public sealed record GetCompanyPaymentsQuery(Guid CompanyId) : ICachedQuery<Result<List<PaymentDto>>>
{
    public string CacheKey => $"company-payments-{CompanyId}";
    
    public string[] Tags => ["company", "payments"];
    
    public TimeSpan Expiration => TimeSpan.FromMinutes(10);
}