namespace ANNUAIRECONGO.Contracts.Requests.Geography;

public sealed record CreateCityRequest(string Name, Guid RegionId);