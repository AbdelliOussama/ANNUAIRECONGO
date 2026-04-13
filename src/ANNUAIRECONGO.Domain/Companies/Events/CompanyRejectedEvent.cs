
using ANNUAIRECONGO.Domain.Common;

namespace ANNUAIRECONGO.Domain.Companies.Events;

public sealed record CompanyRejectedEvent(
    Guid CompanyId,
    string OwnerId,
    string CompanyName,
    string? Reason) : DomainEvent;
