using ANNUAIRECONGO.Domain.Common;

namespace ANNUAIRECONGO.Domain.Companies
{
    public class MarketplaceListing : AuditableEntity
    {
        public Guid Id { get; set; }
        public Guid CompanyId { get; set; }
        public Company Company { get; set; }
        public ListingType Type { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string? Sector { get; set; }
        public string? Location { get; set; }
        public string? BudgetRange { get; set; }
        public bool IsActive { get; set; }
        private MarketplaceListing(){}
        private MarketplaceListing(Guid id,Guid companyId, ListingType type, string title, string description, string? sector, string? location, string? budgetRange): base(id)
        {
            CompanyId = companyId;
            Type = type;
            Title = title;
            Description = description;
            Sector = sector;
            Location = location;
            BudgetRange = budgetRange;
            IsActive = true;
        }

    }
}
