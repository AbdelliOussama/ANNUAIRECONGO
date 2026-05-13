using System.Globalization;
using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Features.Stats.Dtos;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Companies;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Stats.Queries.GetCompanyStats;

/// <summary>
/// Builds the espace/statistiques view model from the analytics tables:
///   - <c>ProfileView</c> rows: one per fiche visit (counts views &amp; unique IPs)
///   - <c>ContactClick</c> rows: one per phone/email/website click
///   - <c>AnalyticsDailySummary</c>: daily roll-up; we sum the last 6 months
///     bucketed by month for the bar chart on the FE.
/// </summary>
public sealed class GetCompanyStatsQueryHandler(
    ILogger<GetCompanyStatsQueryHandler> logger,
    IAppDbContext context,
    IUser currentUser)
    : IRequestHandler<GetCompanyStatsQuery, Result<CompanyStatsDto>>
{
    private readonly ILogger<GetCompanyStatsQueryHandler> _logger = logger;
    private readonly IAppDbContext _context = context;
    private readonly IUser _currentUser = currentUser;

    public async Task<Result<CompanyStatsDto>> Handle(GetCompanyStatsQuery request, CancellationToken cancellationToken)
    {
        var userId = request.UserId ?? _currentUser.Id;
        
        // Ownership check
        var isOwner = await _context.Companies
            .AnyAsync(c => c.Id == request.CompanyId && c.OwnerId.ToString() == userId, cancellationToken);
        
        if (!isOwner)
        {
             _logger.LogWarning("Ownership check failed for Company {CompanyId}. CurrentUserId: {CurrentUserId}", 
                request.CompanyId, userId);
             
             var exists = await _context.Companies.AnyAsync(c => c.Id == request.CompanyId, cancellationToken);
             return exists ? CompanyErrors.NotOwner : CompanyErrors.CompanyNotFound(request.CompanyId);
        }

        // ── Aggregate raw events (TOTALS) ─────────────────────────────
        var views = await _context.ProfileViews
            .Where(v => v.CompanyId == request.CompanyId)
            .CountAsync(cancellationToken);

        var uniqueVisitors = await _context.ProfileViews
            .Where(v => v.CompanyId == request.CompanyId)
            .Select(v => v.ViewerIp)
            .Distinct()
            .CountAsync(cancellationToken);

        var contactClicks = await _context.ContactClicks
            .Where(c => c.CompanyId == request.CompanyId)
            .CountAsync(cancellationToken);

        // ── Search appearances (sum of the daily roll-up) ─────────────
        var searchAppearances = await _context.AnalyticsDailySummaries
            .Where(s => s.CompanyId == request.CompanyId)
            .SumAsync(s => (int?)s.SearchAppearances, cancellationToken) ?? 0;

        // ── 6-month bar chart (Aggregated + Live) ─────────────────────
        var sixMonthsAgo = DateOnly.FromDateTime(DateTimeOffset.UtcNow.DateTime).AddMonths(-5);
        var startOfMonth = new DateOnly(sixMonthsAgo.Year, sixMonthsAgo.Month, 1);

        // 1. Get historical data from summaries
        var monthlySummaries = await _context.AnalyticsDailySummaries
            .Where(s => s.CompanyId == request.CompanyId && s.SummaryDate >= startOfMonth)
            .GroupBy(s => new { s.SummaryDate.Year, s.SummaryDate.Month })
            .Select(g => new
            {
                g.Key.Year,
                g.Key.Month,
                Views = g.Sum(x => x.ProfileViews),
            })
            .ToListAsync(cancellationToken);

        // 2. Get live data from current day (since the aggregation worker hasn't run yet)
        var today = DateTimeOffset.UtcNow.Date;
        var liveViews = await _context.ProfileViews
            .Where(v => v.CompanyId == request.CompanyId && v.ViewedAt >= today)
            .CountAsync(cancellationToken);

        // Fill in buckets
        var fr = CultureInfo.GetCultureInfo("fr-FR");
        var buckets = new List<MonthlyViewBucket>(6);
        for (int i = 0; i < 6; i++)
        {
            var date = startOfMonth.AddMonths(i);
            var found = monthlySummaries.FirstOrDefault(x => x.Year == date.Year && x.Month == date.Month);
            var viewCount = found?.Views ?? 0;
            
            // If this is the current month, add live views
            if (date.Year == DateTimeOffset.UtcNow.Year && date.Month == DateTimeOffset.UtcNow.Month)
            {
                viewCount += liveViews;
            }

            var label = fr.DateTimeFormat.GetAbbreviatedMonthName(date.Month);
            label = char.ToUpperInvariant(label[0]) + label[1..]; 
            buckets.Add(new MonthlyViewBucket(label.TrimEnd('.'), viewCount));
        }

        _logger.LogDebug("Company stats for {CompanyId}: {Views} views, {Visitors} visitors, {Clicks} clicks",
            request.CompanyId, views, uniqueVisitors, contactClicks);

        return new CompanyStatsDto(
            request.CompanyId,
            views,
            uniqueVisitors,
            contactClicks,
            searchAppearances,
            buckets);
    }
}
