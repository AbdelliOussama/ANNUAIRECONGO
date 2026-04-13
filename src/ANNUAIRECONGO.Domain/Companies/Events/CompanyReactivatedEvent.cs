
using ANNUAIRECONGO.Domain.Common;

namespace ANNUAIRECONGO.Domain.Companies.Events;

public sealed record CompanyReactivatedEvent(
    Guid CompanyId,
    string OwnerId,
    string CompanyName) : DomainEvent;
