using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.Identity.Commands.Register;

public sealed record RegisterCommand(
    string Email,
    string Password,
    string FirstName,
    string LastName,
    string PhoneNumber,
    string? CompanyPosition,
    string CompanyName,
    Guid CityId,
    List<Guid> SectorIds,
    string? Website = null,
    string? Rccm = null,
    string? Niu = null
) : IRequest<Result<Guid>>;
