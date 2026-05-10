using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Domain.Analytics;
using ANNUAIRECONGO.Domain.Companies.Events;
using MediatR;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Companies.EventHandlers;

public sealed class CompanyViewedEventHandler(
    IAppDbContext context,
    ILogger<CompanyViewedEventHandler> logger) 
    : INotificationHandler<CompanyViewedEvent>
{
    private readonly IAppDbContext _context = context;
    private readonly ILogger<CompanyViewedEventHandler> _logger = logger;

    public async Task Handle(CompanyViewedEvent notification, CancellationToken cancellationToken)
    {
        var profileViewResult = ProfileView.Create(notification.CompanyId, notification.ViewerIp);
        
        if (profileViewResult.IsError)
        {
            _logger.LogWarning("Could not create ProfileView: {Error}", profileViewResult.Errors.First().Description);
            return;
        }

        await _context.ProfileViews.AddAsync(profileViewResult.Value, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
