using ANNUAIRECONGO.Domain.Common;
using ANNUAIRECONGO.Domain.Common.Results;

namespace ANNUAIRECONGO.Domain.Companies
{
    public class PublicAid : Entity
    {
        public string Name { get; set; } = string.Empty;
        public string Provider { get; set; } = string.Empty;
        public AidType Type { get; set; }
        public decimal MaxAmount { get; set; }
        public string? EligibilityCriteria { get; set; }
        public List<Guid> SectorIds { get; set; } = new List<Guid>();
        public bool IsActive { get; set; }
        private PublicAid() { }
        private PublicAid(string name, string provider, AidType type, decimal maxAmount, string? eligibilityCriteria, List<Guid> sectorIds, bool isActive)
        {
            Name = name;
            Provider = provider;
            Type = type;
            MaxAmount = maxAmount;
            EligibilityCriteria = eligibilityCriteria;
            SectorIds = sectorIds;
            IsActive = isActive;
        }
        public static Result<PublicAid> Create(string name, string provider, AidType type, decimal maxAmount, string? eligibilityCriteria, List<Guid> sectorIds, bool isActive)
        {
            return new PublicAid(name, provider, type, maxAmount, eligibilityCriteria, sectorIds, isActive);
        }
    }
}