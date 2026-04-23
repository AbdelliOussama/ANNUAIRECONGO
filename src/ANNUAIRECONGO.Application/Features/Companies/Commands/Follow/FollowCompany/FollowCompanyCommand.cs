using ANNUAIRECONGO.Application.Features.Companies.Dtos;
using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.Companies.Commands.Follow.FollowCompany;

public sealed record FollowCompanyCommand(Guid CompanyId,DateTimeOffset? LastCheckedAt,bool IsEmailEnabled) : IRequest<Result<CompanyFollowDto>>;