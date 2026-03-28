using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.Plans.Commands.ActivatePlan;

public sealed record ActivatePlanCommand(Guid PlanId) : IRequest<Result<Updated>>;