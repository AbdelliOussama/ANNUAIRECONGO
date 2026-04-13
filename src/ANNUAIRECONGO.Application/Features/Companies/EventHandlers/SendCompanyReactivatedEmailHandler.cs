using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Domain.Companies.Events;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Companies.EventHandlers;

public sealed class SendCompanyReactivatedEmailHandler(ILogger<SendCompanyReactivatedEmailHandler> logger, INotificationService notificationService, IAppDbContext context) : INotificationHandler<CompanyReactivatedEvent>
{
    private readonly ILogger<SendCompanyReactivatedEmailHandler>_logger =logger;
    private readonly IAppDbContext _context = context;
    private readonly INotificationService _notificationService = notificationService;

    public async Task Handle(CompanyReactivatedEvent notification, CancellationToken cancellationToken)
    {
        var company =await _context.Companies.Include(c => c.Owner).FirstOrDefaultAsync(c => c.Id == notification.CompanyId, cancellationToken);
        if(company is null)
        {
            _logger.LogWarning("Company with id {Id} not found", notification.CompanyId);
            return;
        }
        await _notificationService.SendSmsAsync(company.Owner.Phone);
        // await notificationService.SendEmailAsync(company.Owner.Email);
    }
}