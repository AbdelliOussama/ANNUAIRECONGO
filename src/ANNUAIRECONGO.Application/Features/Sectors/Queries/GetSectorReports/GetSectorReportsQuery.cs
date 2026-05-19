using ANNUAIRECONGO.Application.Common.Models;
using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;
using System.Collections.Generic;

namespace ANNUAIRECONGO.Application.Features.Sectors.Queries.GetSectorReports;

public sealed record GetSectorReportsQuery() : IRequest<Result<List<SectorIntelligenceReport>>>;
