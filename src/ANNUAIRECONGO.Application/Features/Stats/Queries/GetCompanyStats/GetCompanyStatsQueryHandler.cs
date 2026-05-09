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
        // Ownership check — the espace endpoint is owner-scoped.
        var company = await _context.Companies
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == request.CompanyId, cancellationToken);

        if (company is null)
            return CompanyErrors.CompanyNotFound(request.CompanyId);

        if (!company.IsOwnedBy(_currentUser.Id ?? string.Empty))
            return CompanyErrors.NotOwner;

        // ── Aggregate raw events ──────────────────────────────────────
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

        // ── 6-month bar chart ────────────────────────────────────────
        var sixMonthsAgo = DateOnly.FromDateTime(DateTime.UtcNow).AddMonths(-5);
        var startOfMonth = new DateOnly(sixMonthsAgo.Year, sixMonthsAgo.Month, 1);

        var monthly = await _context.AnalyticsDailySummaries
            .Where(s => s.CompanyId == request.CompanyId && s.SummaryDate >= startOfMonth)
            .GroupBy(s => new { s.SummaryDate.Year, s.SummaryDate.Month })
            .Select(g => new
            {
                g.Key.Year,
                g.Key.Month,
                Views = g.Sum(x => x.ProfileViews),
            })
            .OrderBy(x => x.Year).ThenBy(x => x.Month)
            .ToListAsync(cancellationToken);

        // Fill in missing months with zero so the FE chart has 6 bars.
        var fr = CultureInfo.GetCultureInfo("fr-FR");
        var buckets = new List<MonthlyViewBucket>(6);
        for (int i = 0; i < 6; i++)
        {
            var date = startOfMonth.AddMonths(i);
            var found = monthly.FirstOrDefault(x => x.Year == date.Year && x.Month == date.Month);
            var label = fr.DateTimeFormat.GetAbbreviatedMonthName(date.Month);
            label = char.ToUpperInvariant(label[0]) + label[1..]; // "Janv." -> "Janv."
            buckets.Add(new MonthlyViewBucket(label.TrimEnd('.'), found?.Views ?? 0));
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
