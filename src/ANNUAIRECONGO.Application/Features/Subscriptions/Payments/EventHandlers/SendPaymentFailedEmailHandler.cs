using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Domain.Companies.Events;
using ANNUAIRECONGO.Domain.Subscriptions.Payments.Events;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Companies.EventHandlers;

public sealed class SendPaymentFailedEmailHandler(ILogger<SendPaymentFailedEmailHandler> logger, INotificationService notificationService, IAppDbContext context) : INotificationHandler<PaymentFailedEvent>
{
    private readonly ILogger<SendPaymentFailedEmailHandler>_logger =logger;
    private readonly IAppDbContext _context = context;
    private readonly INotificationService _notificationService = notificationService;
    public async Task Handle(PaymentFailedEvent notification, CancellationToken cancellationToken)
    {
        var payment =await _context.Payments.Include(p => p.Company).ThenInclude(c => c.Owner).FirstOrDefaultAsync(p => p.Id == notification.PaymentId);
        if(payment is null)
        {
            _logger.LogWarning("Payment with id {Id} not found", notification.PaymentId);
            return;
        }
        await _notificationService.SendSmsAsync(payment.Company.Owner.Phone);
        // await notificationService.SendEmailAsync(payment.Company.Owner.Email);
    }
}