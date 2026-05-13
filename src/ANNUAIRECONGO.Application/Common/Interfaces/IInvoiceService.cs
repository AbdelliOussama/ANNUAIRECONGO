namespace ANNUAIRECONGO.Application.Common.Interfaces;

public interface IInvoiceService
{
    Task<string> GenerateInvoicePdfAsync(Guid paymentId, CancellationToken cancellationToken = default);
}
