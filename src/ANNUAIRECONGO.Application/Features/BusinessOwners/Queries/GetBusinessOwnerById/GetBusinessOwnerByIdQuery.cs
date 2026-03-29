using ANNUAIRECONGO.Application.Features.BusinessOwners.Dtos;
using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.BusinessOwners.Queries.GetBusinessOwnerById;

public sealed record GetBusinessOwnerByIdQuery(Guid Id) : IRequest<Result<BusinessOwnerDto>>;