using System.Net;
using System.Net.Mail;
using ANNUAIRECONGO.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Infrastructure.Services;

public sealed class NotificationService : INotificationService
{
    private readonly ILogger<NotificationService> _logger;
    private readonly IConfiguration _config;
    private const string DefaultMessage = "Notification from ANNUAIRE CONGO.";

    public NotificationService(ILogger<NotificationService> logger, IConfiguration config)
    {
        _logger = logger;
        _config = config;
    }

    private async Task SendSmtpEmailAsync(string to, string subject, string body, CancellationToken ct)
    {
        try
        {
            var host = _config["Smtp:Host"];
            var portString = _config["Smtp:Port"];
            var user = _config["Smtp:Username"];
            var pass = _config["Smtp:Password"];
            var from = _config["Smtp:From"] ?? "noreply@annuairecongo.com";

            if (string.IsNullOrEmpty(host) || string.IsNullOrEmpty(portString))
            {
                _logger.LogWarning("SMTP not configured. Falling back to simulated email for {To}", to);
                return;
            }

            if (!int.TryParse(portString, out int port)) port = 587;

            using var client = new SmtpClient(host, port)
            {
                Credentials = new NetworkCredential(user, pass),
                EnableSsl = true
            };

            var mailMessage = new MailMessage(from, to, subject, body)
            {
                IsBodyHtml = true
            };

            await client.SendMailAsync(mailMessage, ct);
            _logger.LogInformation("Email sent successfully to {To}", to);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {To}", to);
        }
    }

    public async Task SendEmailAsync(string to, CancellationToken cancellationToken = default)
    {
        var at = to.IndexOf('@');
        var maskedEmail = at > 1
            ? to[0] + new string('*', at - 2) + to[at - 1] + to[at..]
            : "*****";

        _logger.LogInformation("[Email] To: {Email} | Message: {Message}", maskedEmail, DefaultMessage);
        await SendSmtpEmailAsync(to, "Notification from ANNUAIRE CONGO", DefaultMessage, cancellationToken);
    }

    public async Task SendEmailAsync(string to, string subject, string body, CancellationToken cancellationToken = default)
    {
        var at = to.IndexOf('@');
        var maskedEmail = at > 1
            ? to[0] + new string('*', at - 2) + to[at - 1] + to[at..]
            : "*****";

        _logger.LogInformation("[Email] To: {Email} | Subject: {Subject} | Body: {Body}", maskedEmail, subject, body);
        await SendSmtpEmailAsync(to, subject, body, cancellationToken);
    }

    public async Task SendSmsAsync(string phoneNumber, CancellationToken cancellationToken = default)
    {
        var masked = phoneNumber.Length >= 4
            ? new string('*', phoneNumber.Length - 4) + phoneNumber[^4..]
            : "****";

        _logger.LogInformation("[SMS] To: {Phone} | Message: {Message}", masked, DefaultMessage);
        await Task.CompletedTask;
    }
}
