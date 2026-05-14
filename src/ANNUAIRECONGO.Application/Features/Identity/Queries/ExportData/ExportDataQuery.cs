using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.Identity.Queries.ExportData;

public sealed record ExportDataQuery(string UserId) : IRequest<Result<string>>;
