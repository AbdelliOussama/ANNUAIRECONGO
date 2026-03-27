using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.Companies.Commands.StatusTransition.RejectCompany;
public sealed record RejectCompanyCommand(Guid companyId, string reason) : IRequest<Result<Updated>>;