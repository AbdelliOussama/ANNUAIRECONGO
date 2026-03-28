using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.Plans.Commands.DeActivatePlan;

public sealed record DeActivatePlanCommand(Guid PlanId) : IRequest<Result<Updated>>;