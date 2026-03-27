using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.Companies.Commands.StatusTransition.SuspendCompnay;
public sealed record SuspendCompanyCommand(Guid companyId) : IRequest<Result<Updated>>;