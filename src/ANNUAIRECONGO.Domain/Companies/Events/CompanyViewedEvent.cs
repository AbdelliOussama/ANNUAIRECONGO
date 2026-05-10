using ANNUAIRECONGO.Domain.Common;

namespace ANNUAIRECONGO.Domain.Companies.Events;

public sealed record CompanyViewedEvent(Guid CompanyId, string ViewerIp) : DomainEvent;
