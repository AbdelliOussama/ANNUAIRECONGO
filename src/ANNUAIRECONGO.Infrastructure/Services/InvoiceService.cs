using ANNUAIRECONGO.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Infrastructure.Services;

public class InvoiceService : IInvoiceService
{
    private readonly ILogger<InvoiceService> _logger;

    public InvoiceService(ILogger<InvoiceService> logger)
    {
        _logger = logger;
    }

    public Task<string> GenerateInvoicePdfAsync(Guid paymentId, CancellationToken cancellationToken = default)
    {
        // For the time being, simulate invoice generation.
        // In a production environment, this would use a PDF generation library (like QuestPDF)
        // and upload the resulting file to a storage service (S3, Azure Blob, etc.).
        _logger.LogInformation("Generating invoice for payment {PaymentId}", paymentId);
        
        var dummyUrl = $"/api/v1/uploads/invoices/{paymentId}.pdf";
        return Task.FromResult(dummyUrl);
    }
}
