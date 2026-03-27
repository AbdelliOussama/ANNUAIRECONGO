using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.Companies.Commands.StatusTransition.ReactivateCompany;
public sealed record ReactivateCompanyCommand(Guid companyId) : IRequest<Result<Updated>>;