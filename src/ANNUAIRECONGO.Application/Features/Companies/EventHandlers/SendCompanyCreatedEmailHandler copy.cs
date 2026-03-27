using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Domain.Companies.Events;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Companies.EventHandlers;

public sealed class SendCompanyCreatedEmailHandler(ILogger<SendCompanyCreatedEmailHandler> logger, INotificationService notificationService, IAppDbContext context) : INotificationHandler<CompanyCreatedEvent>
{
    private readonly ILogger<SendCompanyCreatedEmailHandler>_logger =logger;
    private readonly IAppDbContext _context = context;
    private readonly INotificationService _notificationService = notificationService;
    public async Task Handle(CompanyCreatedEvent notification, CancellationToken cancellationToken)
    {
        var company =await _context.Companies.Include(c => c.Owner).FirstOrDefaultAsync(c => c.Id == notification.CompanyId);
        if(company is null)
        {
            _logger.LogWarning("Company with id {Id} not found", notification.CompanyId);
            return;
        }
        await _notificationService.SendSmsAsync(company.Owner.Phone);
        // await notificationService.SendEmailAsync(company.Owner.Email);
    }
}