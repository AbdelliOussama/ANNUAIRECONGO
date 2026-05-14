using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.Stats.Queries.GetCompanyStatsExport;

public sealed record GetCompanyStatsExportQuery(Guid CompanyId, string? UserId = null) : IRequest<Result<byte[]>>;
