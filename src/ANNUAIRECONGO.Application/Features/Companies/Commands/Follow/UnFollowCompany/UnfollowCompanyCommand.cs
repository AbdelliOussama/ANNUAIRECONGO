using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.Companies.Commands.Follow.UnFollowCompany;

public sealed record UnfollowCompanyCommand(Guid Id) : IRequest<Result<Deleted>>;