using ANNUAIRECONGO.Application.Features.Stats.Dtos;
using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.Stats.Queries.GetCompanyStats;

/// <summary>
/// Returns the analytics summary for one company. The caller MUST be the
/// owner of the company; the handler enforces this.
/// </summary>
public sealed record GetCompanyStatsQuery(Guid CompanyId, string? UserId) : IRequest<Result<CompanyStatsDto>>;
