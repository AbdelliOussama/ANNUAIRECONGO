using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.Companies.Commands.StatusTransition.VerifyCompany;

public sealed record VerifyCompanyCommand(Guid CompanyId) : IRequest<Result<Updated>>;
