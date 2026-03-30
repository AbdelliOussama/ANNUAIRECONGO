namespace ANNUAIRECONGO.Application.Features.Geography.Dtos;

public sealed record CityDto
{
    public Guid Id { get; set;}
    public string Name{ get; set;}
    public Guid RegionId{ get; set;}
}