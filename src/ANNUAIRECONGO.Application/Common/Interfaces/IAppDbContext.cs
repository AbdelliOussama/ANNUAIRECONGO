using AnnuaireCongo.Domain.Notifications;
using ANNUAIRECONGO.Domain.Analytics;
using ANNUAIRECONGO.Domain.BusinessOwners;
using ANNUAIRECONGO.Domain.Companies;
using ANNUAIRECONGO.Domain.Geography;
using ANNUAIRECONGO.Domain.Identity;
using ANNUAIRECONGO.Domain.Logs;
using ANNUAIRECONGO.Domain.Sectors;
using ANNUAIRECONGO.Domain.Subscriptions;
using ANNUAIRECONGO.Domain.Subscriptions.Payments;
using ANNUAIRECONGO.Domain.Subscriptions.Plans;
using Microsoft.EntityFrameworkCore;

namespace ANNUAIRECONGO.Application.Common.Interfaces;

public interface IAppDbContext
{
    public DbSet<RefreshToken>RefreshTokens{get;}
    public DbSet<BusinessOwner>BusinessOwners{get;}
    public DbSet<Region> Regions { get; }
    public DbSet<City> Cities { get; }
    public DbSet<Company> Companies { get; }
    public DbSet<Sector> Sectors { get; }
    public DbSet<CompanyContact> CompanyContacts { get; }
    public DbSet<CompanySector> CompanySectors { get; }
    public DbSet<CompanyImage> CompanyImages { get; }
    public DbSet<CompanyDocument> CompanyDocuments { get; }
    public DbSet<CompanyService> CompanyServices { get; }
    public DbSet<CompanyReport> CompanyReports { get; }
    public DbSet<AnalyticsDailySummary> AnalyticsDailySummaries { get; }
    public DbSet<ContactClick> ContactClicks { get; }
    public DbSet<ProfileView> ProfileViews { get; }
    public DbSet<AdminLog> AdminLogs { get; }
    public DbSet<Notification> Notifications { get; }
    public DbSet<Subscription> Subscriptions { get; }
    public DbSet<Payment> Payments { get; }
    public DbSet<Plan> Plans { get; }

    // Competitors Features
    public DbSet<CompanyFollow> CompanyFollows { get; }
    public DbSet<CreditRatingQuery> CreditRatings { get; }





    public Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}