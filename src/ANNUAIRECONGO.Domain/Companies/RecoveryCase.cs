using ANNUAIRECONGO.Domain.Common;
using ANNUAIRECONGO.Domain.Common.Results;

namespace ANNUAIRECONGO.Domain.Companies;

public class RecoveryCase : AuditableEntity
{
    public Guid CreditorCompanyId { get;private set; }
    public Company CreditorCompany { get;private set; }
    public string DebtorIdentifier { get;private set; }
    public decimal Amount { get;private set; }
    public string Currency { get;private set; }
    public DateTime? DueDate { get;private set; }
    public string InvoiceFileUrl { get; private set; }
    public RecoveryCaseStatus Status { get; private set; }

    private RecoveryCase() { }
    private RecoveryCase(Guid Id, Guid creditorCompanyId, string debtorIdentifier, decimal amount, string currency, DateTime? dueDate, string invoiceFileUrl): base(Id)
    {
        CreditorCompanyId = creditorCompanyId;
        DebtorIdentifier = debtorIdentifier;
        Amount = amount;
        Currency = currency;
        DueDate = dueDate;
        InvoiceFileUrl = invoiceFileUrl;
        Status = RecoveryCaseStatus.Open;
    }

    public static Result<RecoveryCase> Create(Guid Id, Guid creditorCompanyId, string debtorIdentifier, decimal amount, string currency, DateTime? dueDate, string invoiceFileUrl)
    {
        if(creditorCompanyId == Guid.Empty)
            return CompanyErrors.InvalidCreditorCompanyId;
        if(string.IsNullOrWhiteSpace(debtorIdentifier))
            return CompanyErrors.InvalidDebtorIdentifier;
        if(amount <= 0)
            return CompanyErrors.InvalidAmount;
        if(string.IsNullOrWhiteSpace(currency))
            return CompanyErrors.InvalidCurrency;

        return new RecoveryCase(Id, creditorCompanyId, debtorIdentifier, amount, currency, dueDate, invoiceFileUrl);
    }
}
