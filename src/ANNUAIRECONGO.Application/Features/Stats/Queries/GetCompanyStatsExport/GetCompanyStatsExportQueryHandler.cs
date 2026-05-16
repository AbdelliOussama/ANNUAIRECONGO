using System.Text;
using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Companies;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Stats.Queries.GetCompanyStatsExport;

public sealed class GetCompanyStatsExportQueryHandler(
    ILogger<GetCompanyStatsExportQueryHandler> logger,
    IAppDbContext context,
    IUser currentUser)
    : IRequestHandler<GetCompanyStatsExportQuery, Result<byte[]>>
{
    private readonly ILogger<GetCompanyStatsExportQueryHandler> _logger = logger;
    private readonly IAppDbContext _context = context;
    private readonly IUser _currentUser = currentUser;

    public async Task<Result<byte[]>> Handle(GetCompanyStatsExportQuery request, CancellationToken cancellationToken)
    {
        var userId = request.UserId ?? _currentUser.Id;

        if (!Guid.TryParse(userId, out var ownerGuid))
        {
            _logger.LogWarning("Invalid User ID format: {UserId}", userId);
            return CompanyErrors.NotOwner;
        }

        // Ownership check
        var isOwner = await _context.Companies
            .AnyAsync(c => c.Id == request.CompanyId && c.OwnerId == ownerGuid, cancellationToken);

        if (!isOwner)
        {
            _logger.LogWarning("Ownership check failed for Company {CompanyId}. CurrentUserId: {CurrentUserId}",
               request.CompanyId, userId);

            var exists = await _context.Companies.AnyAsync(c => c.Id == request.CompanyId, cancellationToken);
            return exists ? CompanyErrors.NotOwner : CompanyErrors.CompanyNotFound(request.CompanyId);
        }

        // We fetch the historical daily summaries for the CSV
        var data = await _context.AnalyticsDailySummaries
            .Where(s => s.CompanyId == request.CompanyId)
            .OrderByDescending(s => s.SummaryDate)
            .ToListAsync(cancellationToken);

        var csvBuilder = new StringBuilder();
        csvBuilder.AppendLine("Date,Vues de profil,Apparitions en recherche");

        foreach (var row in data)
        {
            csvBuilder.AppendLine($"{row.SummaryDate:yyyy-MM-dd},{row.ProfileViews},{row.SearchAppearances}");
        }

        var bytes = Encoding.UTF8.GetBytes(csvBuilder.ToString());
        return bytes;
    }
}
