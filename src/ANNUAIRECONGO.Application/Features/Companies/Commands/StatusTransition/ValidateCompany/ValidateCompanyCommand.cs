using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.Companies.Commands.StatusTransition.ValidateCompany;

public sealed record ValidateCompanyCommand(Guid CompanyId) :IRequest<Result<Updated>> ;