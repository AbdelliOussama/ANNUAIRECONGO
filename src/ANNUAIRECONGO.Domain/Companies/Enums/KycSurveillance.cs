using ANNUAIRECONGO.Domain.Common;

namespace ANNUAIRECONGO.Domain.Companies
{
    public class KycSurveillance : AuditableEntity
    {
        public string WatcherUserId { get; set; } = string.Empty;
        public Guid WatchedCompanyId { get; set; }
        public ComplianceStatus ComplianceStatus { get; set; }
        public DateTime? LastVerifiedAt { get; set; }
        public DateTime? NextVerificationAt { get; set; }
        public string? AlertMessage { get; set; }
    }
}