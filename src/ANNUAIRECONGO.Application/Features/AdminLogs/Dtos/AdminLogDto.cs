namespace ANNUAIRECONGO.Application.Features.AdminLogs.Dtos
{
    public class AdminLogDto
    {
        public Guid Id { get; set; }
        public string AdminId { get; set; } = default!;
        public string Action { get; set; } = default!;
        public string TargetType { get; set; } = default!;
        public Guid TargetId { get; set; }
        public string? Details { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}