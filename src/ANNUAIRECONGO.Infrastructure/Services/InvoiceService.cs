using ANNUAIRECONGO.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace ANNUAIRECONGO.Infrastructure.Services;

public class InvoiceService : IInvoiceService
{
    private readonly ILogger<InvoiceService> _logger;
    private readonly IAppDbContext _context;
    private readonly IStorageService _storageService;

    public InvoiceService(
        ILogger<InvoiceService> logger,
        IAppDbContext context,
        IStorageService storageService)
    {
        _logger = logger;
        _context = context;
        _storageService = storageService;

        // Ensure community license is set for QuestPDF
        QuestPDF.Settings.License = LicenseType.Community;
    }

    public async Task<string> GenerateInvoicePdfAsync(Guid paymentId, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Generating invoice for payment {PaymentId}", paymentId);

        var payment = await _context.Payments
            .Include(p => p.Company)
            .Include(p => p.Subscription)
            .FirstOrDefaultAsync(p => p.Id == paymentId, cancellationToken);

        if (payment == null)
        {
            _logger.LogWarning("Payment {PaymentId} not found. Cannot generate invoice.", paymentId);
            return string.Empty;
        }

        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(2, Unit.Centimetre);
                page.PageColor(Colors.White);
                page.DefaultTextStyle(x => x.FontSize(11));

                page.Header().Element(ComposeHeader);
                page.Content().Element(x => ComposeContent(x, payment));
                page.Footer().Element(ComposeFooter);
            });
        });

        using var memoryStream = new MemoryStream();
        document.GeneratePdf(memoryStream);
        memoryStream.Position = 0;

        var fileName = $"{payment.Reference}.pdf";
        var invoiceUrl = await _storageService.UploadAsync(memoryStream, fileName, "invoices", cancellationToken);

        _logger.LogInformation("Invoice generated and uploaded to {Url}", invoiceUrl);
        return invoiceUrl;
    }

    private void ComposeHeader(IContainer container)
    {
        container.Row(row =>
        {
            row.RelativeItem().Column(column =>
            {
                column.Item().Text("ANNUAIRE CONGO").FontSize(20).SemiBold().FontColor(Colors.Blue.Darken2);
                column.Item().Text("Facture").FontSize(16).SemiBold();
            });
        });
    }

    private void ComposeContent(IContainer container, ANNUAIRECONGO.Domain.Subscriptions.Payments.Payment payment)
    {
        container.PaddingVertical(1, Unit.Centimetre).Column(column =>
        {
            column.Spacing(20);

            column.Item().Row(row =>
            {
                row.RelativeItem().Component(new AddressComponent("Facturé à:", payment.Company.Name, "Congo")); 
                row.ConstantItem(50);
                row.RelativeItem().AlignRight().Column(c =>
                {
                    c.Item().Text($"Référence: {payment.Reference}").SemiBold();
                    c.Item().Text($"Date: {(payment.PaidAt ?? DateTimeOffset.UtcNow).ToString("dd/MM/yyyy")}");
                });
            });

            column.Item().Element(c => ComposeTable(c, payment));
            
            column.Item().AlignRight().Text($"Total: {payment.Amount:N0} {payment.Currency}").FontSize(14).SemiBold();
        });
    }

    private void ComposeTable(IContainer container, ANNUAIRECONGO.Domain.Subscriptions.Payments.Payment payment)
    {
        container.Table(table =>
        {
            table.ColumnsDefinition(columns =>
            {
                columns.RelativeColumn(3);
                columns.RelativeColumn();
                columns.RelativeColumn();
            });

            table.Header(header =>
            {
                header.Cell().Element(CellStyle).Text("Description");
                header.Cell().Element(CellStyle).AlignRight().Text("Quantité");
                header.Cell().Element(CellStyle).AlignRight().Text("Prix");

                static IContainer CellStyle(IContainer container)
                {
                    return container.DefaultTextStyle(x => x.SemiBold()).PaddingVertical(5).BorderBottom(1).BorderColor(Colors.Black);
                }
            });

            table.Cell().Element(CellStyle).Text($"Abonnement");
            table.Cell().Element(CellStyle).AlignRight().Text("1");
            table.Cell().Element(CellStyle).AlignRight().Text($"{payment.Amount:N0} {payment.Currency}");

            static IContainer CellStyle(IContainer container)
            {
                return container.BorderBottom(1).BorderColor(Colors.Grey.Lighten2).PaddingVertical(5);
            }
        });
    }

    private void ComposeFooter(IContainer container)
    {
        container.AlignCenter().Text(x =>
        {
            x.Span("Page ");
            x.CurrentPageNumber();
            x.Span(" sur ");
            x.TotalPages();
        });
    }
}

public class AddressComponent : IComponent
{
    private string Title { get; }
    private string Name { get; }
    private string City { get; }

    public AddressComponent(string title, string name, string city)
    {
        Title = title;
        Name = name;
        City = city;
    }

    public void Compose(IContainer container)
    {
        container.Column(column =>
        {
            column.Spacing(2);
            column.Item().Text(Title).SemiBold();
            column.Item().Text(Name);
            column.Item().Text(City);
        });
    }
}
