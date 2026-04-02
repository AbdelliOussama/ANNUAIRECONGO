using System;

namespace ANNUAIRECONGO.Application.Features.Companies.Dtos.Services;

public class ServiceDto
{
    public Guid Id { get; set; }
    public Guid CompanyId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
}