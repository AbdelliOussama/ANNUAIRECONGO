using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Domain.Analytics;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Infrastructure.BackgroundServices;

public class AnalyticsAggregationBackgroundService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<AnalyticsAggregationBackgroundService> _logger;

    public AnalyticsAggregationBackgroundService(
        IServiceProvider serviceProvider,
        ILogger<AnalyticsAggregationBackgroundService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await AggregateAnalyticsAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while aggregating analytics");
            }

            await Task.Delay(TimeSpan.FromDays(1), stoppingToken);
        }
    }

    private async Task AggregateAnalyticsAsync(CancellationToken stoppingToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<IAppDbContext>();

        var targetDate = DateOnly.FromDateTime(DateTime.Now.AddDays(-1));

        _logger.LogInformation("Starting analytics aggregation for date {Date}", targetDate);

        var companyIds = await dbContext.Companies
            .Where(c => c.Status == Domain.Companies.Enums.CompanyStatus.Active)
            .Select(c => c.Id)
            .ToListAsync(stoppingToken);

        foreach (var companyId in companyIds)
        {
            await AggregateCompanyAnalyticsAsync(dbContext, companyId, targetDate, stoppingToken);
        }

        _logger.LogInformation("Completed analytics aggregation for date {Date}", targetDate);
    }

    private async Task AggregateCompanyAnalyticsAsync(
        IAppDbContext dbContext,
        Guid companyId,
        DateOnly targetDate,
        CancellationToken stoppingToken)
    {
        var startOfDay = targetDate.ToDateTime(TimeOnly.MinValue);
        var endOfDay = targetDate.ToDateTime(TimeOnly.MaxValue);

        var profileViewCount = await dbContext.ProfileViews
            .Where(pv => pv.CompanyId == companyId && pv.ViewedAt >= startOfDay && pv.ViewedAt <= endOfDay)
            .CountAsync(stoppingToken);

        var contactClickCount = await dbContext.ContactClicks
            .Where(cc => cc.CompanyId == companyId && cc.ClickedAt >= startOfDay && cc.ClickedAt <= endOfDay)
            .CountAsync(stoppingToken);

        var existingSummary = await dbContext.AnalyticsDailySummaries
            .FirstOrDefaultAsync(s => s.CompanyId == companyId && s.SummaryDate == targetDate, stoppingToken);

        if (existingSummary is null)
        {
            var summaryResult = AnalyticsDailySummary.Create(
                companyId,
                targetDate,
                profileViewCount,
                contactClickCount,
                0);

            if (summaryResult.IsSuccess)
            {
                dbContext.AnalyticsDailySummaries.Add(summaryResult.Value);
            }
        }
        else
        {
            existingSummary.UpdateCounts(profileViewCount, contactClickCount, existingSummary.SearchAppearances);
        }

        await dbContext.SaveChangesAsync(stoppingToken);
    }
}