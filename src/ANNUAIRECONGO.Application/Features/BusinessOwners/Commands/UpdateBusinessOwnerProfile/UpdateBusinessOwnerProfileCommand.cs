using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.BusinessOwners.Commands.UpdateBusinessOwnerProfile;

public sealed record UpdateBusinessOwnerProfileCommand(
    Guid Id,
    string Name,
    string Email,
    string PhoneNumber,
    string CompanyPosition
) : IRequest<Result<Updated>>;