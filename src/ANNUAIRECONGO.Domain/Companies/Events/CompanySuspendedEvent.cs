
using ANNUAIRECONGO.Domain.Common;

namespace ANNUAIRECONGO.Domain.Companies.Events;

public sealed record CompanySuspendedEvent(
    Guid CompanyId,
    string OwnerId,
    string CompanyName) : DomainEvent;
