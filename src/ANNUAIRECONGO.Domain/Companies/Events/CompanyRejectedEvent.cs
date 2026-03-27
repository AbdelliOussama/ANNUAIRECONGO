
using ANNUAIRECONGO.Domain.Common;

namespace ANNUAIRECONGO.Domain.Companies.Events;

public sealed record CompanyRejectedEvent(
    Guid CompanyId,
    Guid OwnerId,
    string CompanyName,
    string? Reason) : DomainEvent;
