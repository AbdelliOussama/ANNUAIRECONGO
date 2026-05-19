using ANNUAIRECONGO.Application.Common.Models;
using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;
using System;

namespace ANNUAIRECONGO.Application.Features.Sectors.Commands.GenerateSectorReport;

public sealed record GenerateSectorReportCommand(Guid SectorId) : IRequest<Result<SectorIntelligenceReport>>;
