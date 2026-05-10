using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.Companies.Commands.StatusTransition.SuspendCompany;
public sealed record SuspendCompanyCommand(Guid companyId) : IRequest<Result<Updated>>;