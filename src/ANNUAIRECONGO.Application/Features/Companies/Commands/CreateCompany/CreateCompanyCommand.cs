using ANNUAIRECONGO.Application.Features.Companies.Dtos;
using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.Companies.Commands.CreateCompany;

public sealed record CreateCompanyCommand(string Name, Guid CityId, IEnumerable<Guid> SectorIds,string Description,string Address,decimal? Latitude,decimal? Longitude) : IRequest<Result<CompanyDto>>;
