using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Common.Models;
using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace ANNUAIRECONGO.Application.Features.Sectors.Queries.GetSectorReports;

public sealed record GetSectorReportsQueryHandler(
    ILogger<GetSectorReportsQueryHandler> logger, 
    IGrokService grokService) 
    : IRequestHandler<GetSectorReportsQuery, Result<List<SectorIntelligenceReport>>>
{
    private readonly IGrokService _grokService = grokService;
    private readonly ILogger<GetSectorReportsQueryHandler> _logger = logger;

    public async Task<Result<List<SectorIntelligenceReport>>> Handle(GetSectorReportsQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Retrieving AI economic sector intelligence reports.");
        var reports = await _grokService.GetSectorReportsAsync(cancellationToken);
        return reports;
    }
}
